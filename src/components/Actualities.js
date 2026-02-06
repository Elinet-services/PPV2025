import { useEffect, useState } from "react";
import { MDBBtn, MDBListGroup, MDBListGroupItem, MDBTabs, MDBTabsItem, MDBTabsLink } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

import { formatDate } from "../services/connection";
import { normalizeLanguage, translateHtml, translateText } from "../services/translation";
import LoadingSpinner from "./LoadingSpinner";

const TRANSLATE_UI = {
  cs: {
    translate: "Přeložit",
    original: "Original",
    translating: "Překládám...",
    error: "Překlad se nepodařil.",
  },
  en: {
    translate: "Translate",
    original: "Original",
    translating: "Translating...",
    error: "Translation failed.",
  },
  de: {
    translate: "\u00dcbersetzen",
    original: "Original",
    translating: "\u00dcbersetze...",
    error: "\u00dcbersetzung fehlgeschlagen.",
  },
  fr: {
    translate: "Traduire",
    original: "Original",
    translating: "Traduction...",
    error: "\u00c9chec de la traduction.",
  },
};

const decodeBodyText = (bodyText) => {
  try {
    return decodeURIComponent(bodyText || "");
  } catch {
    return bodyText || "";
  }
};

const Actualities = ({ noteList }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [allNoteList, setAllNoteList] = useState(false);
  const [translatedNotes, setTranslatedNotes] = useState({});
  const [translatingNotes, setTranslatingNotes] = useState({});
  const [translationErrors, setTranslationErrors] = useState({});

  const currentLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const translateUi = TRANSLATE_UI[currentLanguage] || TRANSLATE_UI.en;
  const showTranslateControls = currentLanguage !== "cs";

  const sortedNoteList = [...noteList].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filteredNoteList = allNoteList ? sortedNoteList : sortedNoteList.slice(0, 1);

  useEffect(() => {
    if (!noteList || noteList.length === 0) return;
    setLoading(false);
  }, [noteList]);

  useEffect(() => {
    setTranslatedNotes({});
    setTranslatingNotes({});
    setTranslationErrors({});
  }, [currentLanguage]);

  const getNoteKey = (note, index) => {
    const rowKey = note.rowNr !== undefined && note.rowNr !== null ? `row-${note.rowNr}` : `idx-${index}`;
    return `${note.date || "no-date"}-${rowKey}`;
  };

  const getTranslationKey = (note, index) => `${currentLanguage}:${getNoteKey(note, index)}`;

  const handleTranslateNote = async (note, index) => {
    if (!showTranslateControls) return;

    const translationKey = getTranslationKey(note, index);
    const bodyText = decodeBodyText(note.bodyText);

    setTranslatingNotes((previous) => ({ ...previous, [translationKey]: true }));
    setTranslationErrors((previous) => ({ ...previous, [translationKey]: false }));

    try {
      const [translatedHeader, translatedBodyText] = await Promise.all([
        translateText(note.header || "", currentLanguage),
        translateHtml(bodyText, currentLanguage),
      ]);

      setTranslatedNotes((previous) => ({
        ...previous,
        [translationKey]: {
          header: translatedHeader,
          bodyText: translatedBodyText,
        },
      }));
    } catch (error) {
      console.error("Actuality translation failed:", error);
      setTranslationErrors((previous) => ({ ...previous, [translationKey]: true }));
    } finally {
      setTranslatingNotes((previous) => ({ ...previous, [translationKey]: false }));
    }
  };

  const handleShowOriginal = (note, index) => {
    const translationKey = getTranslationKey(note, index);

    setTranslatedNotes((previous) => {
      const nextState = { ...previous };
      delete nextState[translationKey];
      return nextState;
    });
    setTranslationErrors((previous) => ({ ...previous, [translationKey]: false }));
  };

  return (
    <div id="actualities">
      <MDBTabs>
        <MDBTabsItem>
          <MDBTabsLink onClick={() => setAllNoteList(false)} active={allNoteList === false}>
            {t("actualities.latest")}
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink onClick={() => setAllNoteList(true)} active={allNoteList === true}>
            {t("actualities.all")}
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>

      {loading ? (
        <LoadingSpinner className="my-4" height="100px" label={t("actualities.loading")} />
      ) : (
        <MDBListGroup>
          {filteredNoteList.map((note, index) => {
            const translationKey = getTranslationKey(note, index);
            const translatedNote = translatedNotes[translationKey];
            const isTranslated = Boolean(translatedNote);
            const isTranslating = Boolean(translatingNotes[translationKey]);
            const hasTranslationError = Boolean(translationErrors[translationKey]);
            const originalBodyText = decodeBodyText(note.bodyText);

            const headerToRender = translatedNote?.header || note.header;
            const bodyToRender = translatedNote?.bodyText || originalBodyText;

            return (
              <MDBListGroupItem key={getNoteKey(note, index)}>
                <h6 className="actualities-meta d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span>
                    {formatDate(note.date)} - <b>{headerToRender}</b>
                  </span>
                  {showTranslateControls ? (
                    <MDBBtn
                      color={isTranslated ? "secondary" : "light"}
                      size="sm"
                      onClick={() => (isTranslated ? handleShowOriginal(note, index) : handleTranslateNote(note, index))}
                      disabled={isTranslating}
                    >
                      {isTranslating ? translateUi.translating : isTranslated ? translateUi.original : translateUi.translate}
                    </MDBBtn>
                  ) : null}
                </h6>

                {showTranslateControls && hasTranslationError ? (
                  <small className="text-danger d-block mb-2">{translateUi.error}</small>
                ) : null}

                <span className="actualities-body" dangerouslySetInnerHTML={{ __html: bodyToRender }} />
              </MDBListGroupItem>
            );
          })}
        </MDBListGroup>
      )}
    </div>
  );
};

export default Actualities;
