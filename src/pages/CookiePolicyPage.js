import { MDBBtn, MDBContainer, MDBListGroup, MDBListGroupItem, MDBTypography } from "mdb-react-ui-kit";
import { clearCookieConsent, getCookieConsent } from "../components/CookieConsent";

const CookiePolicyPage = () => {
  return (
    <MDBContainer className="my-5">
      <MDBTypography tag="h4" className="mb-3 text-start">
        {"Cookies"}
      </MDBTypography>

      <MDBTypography className="text-start mb-3">
        {
          "Tento web používá nezbytné cookies potřebné pro jeho funkčnost (např. přihlášení a udržení relace)."
        }
      </MDBTypography>

      <MDBTypography className="text-start mb-3">
        {
          "Volitelné cookies (např. analytické nebo marketingové) aktuálně nepoužíváme. Pokud je v budoucnu přidáme, budete je moci povolit/odmítnout v cookie liště."
        }
      </MDBTypography>

      <MDBTypography tag="h5" className="mb-2 text-start">
        {"Nezbytné cookies používané tímto webem"}
      </MDBTypography>
      <MDBTypography className="text-start mb-2">
        {"Tyto cookies jsou potřeba pro přihlášení a práci s účtem:"}
      </MDBTypography>
      <MDBListGroup className="mb-4">
        <MDBListGroupItem>
          <b>{"token"}</b>
          {" – přihlašovací token (udržení relace po přihlášení)."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          <b>{"email"}</b>
          {" – e‑mail přihlášeného uživatele (pro identifikaci v aplikaci)."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          <b>{"role"}</b>
          {" – role uživatele (např. uživatel/admin)."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          <b>{"userName"}</b>
          {" – jméno uživatele pro zobrazení v menu."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          <b>{"rights"}</b>
          {" – práva uživatele (řízení přístupů k funkcím)."}
        </MDBListGroupItem>
      </MDBListGroup>

      <MDBTypography tag="h5" className="mb-2 text-start">
        {"Nastavení souhlasu"}
      </MDBTypography>
      <MDBTypography className="text-start mb-3">
        {"Aktuální volba: "}
        <b>{getCookieConsent() || "nezvoleno"}</b>
        {"."}
      </MDBTypography>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <MDBBtn
          color="secondary"
          type="button"
          onClick={() => clearCookieConsent()}
        >
          {"Změnit volbu cookies"}
        </MDBBtn>
      </div>

      <MDBTypography className="text-start">
        {"Pokud máte dotazy, kontaktujte nás na "}
        <a href="mailto:poradatel@ppvcup.cz">poradatel@ppvcup.cz</a>
        {"."}
      </MDBTypography>
    </MDBContainer>
  );
};

export default CookiePolicyPage;
