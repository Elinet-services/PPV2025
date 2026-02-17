import {
  MDBDropdown,
  MDBDropdownItem,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBIcon,
} from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "cs", flag: "cz" },
  { code: "en", flag: "gb" },
  { code: "de", flag: "de" },
  { code: "fr", flag: "fr" },
];

const LanguageSwitcher = ({ compact = false }) => {
  const { i18n, t } = useTranslation();
  const resolved = (i18n.resolvedLanguage || "cs").toLowerCase().split("-")[0];
  const activeLanguage = LANGUAGES.find((language) => language.code === resolved) || LANGUAGES[0];

  return (
    <MDBDropdown className={compact ? "language-switcher language-switcher-compact" : "language-switcher"}>
      <MDBDropdownToggle tag="button" className="btn btn-light btn-sm" type="button">
        <MDBIcon flag={activeLanguage.flag} className="language-switcher-flag" aria-hidden="true" />
        <span className="language-switcher-code">{activeLanguage.code.toUpperCase()}</span>
      </MDBDropdownToggle>
      <MDBDropdownMenu>
        {LANGUAGES.map((language) => (
          <MDBDropdownItem
            key={language.code}
            link
            childTag="button"
            className={activeLanguage.code === language.code ? "active" : ""}
            onClick={() => i18n.changeLanguage(language.code)}
          >
            <MDBIcon flag={language.flag} className="language-switcher-flag" aria-hidden="true" />
            <span className="language-switcher-label">{t(`common.language.${language.code}`)}</span>
          </MDBDropdownItem>
        ))}
      </MDBDropdownMenu>
    </MDBDropdown>
  );
};

export default LanguageSwitcher;
