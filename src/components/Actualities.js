import { useState, useEffect } from "react";
import {
  MDBListGroup,
  MDBListGroupItem,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBSpinner,
} from "mdb-react-ui-kit";
import { formatDate } from "../services/connection.js";

const Actualities = ({ noteList }) => {
  const [loading, setLoading] = useState(true);
  const [allNoteList, setAllNoteList] = useState(false);

  // ✅ Seřadit od nejnovějších po nejstarší (bez mutace původního pole)
  const sortedNoteList = [...noteList].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // ✅ Buď všechny, nebo jen poslední aktualita
  const filteredNoteList = allNoteList
    ? sortedNoteList
    : sortedNoteList.slice(0, 1);

  useEffect(() => {
    if (!noteList || noteList.length === 0) return;
    setLoading(false);
  }, [noteList]);

  return (
    <div id="actualities">
      <MDBTabs>
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => setAllNoteList(false)}
            active={allNoteList === false}
          >
            Poslední aktualita
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => setAllNoteList(true)}
            active={allNoteList === true}
          >
            Všechny aktuality
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>

      {loading ? (
        <MDBSpinner role="status" className="text-left my-4">
          <span className="visually-hidden">Načítám aktuality...</span>
        </MDBSpinner>
      ) : (
        <MDBListGroup>
          {filteredNoteList.map(({ date, header, bodyText }, index) => (
            <MDBListGroupItem key={index}>
              <h6 className="actualities-meta">
                {formatDate(date)} - <b>{header}</b>
              </h6>
              <span
                className="actualities-body"
                dangerouslySetInnerHTML={{
                  __html: decodeURIComponent(bodyText),
                }}
              />
            </MDBListGroupItem>
          ))}
        </MDBListGroup>
      )}
    </div>
  );
};

export default Actualities;
