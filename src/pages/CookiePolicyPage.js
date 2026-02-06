import { MDBContainer, MDBTypography } from "mdb-react-ui-kit";

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

      <MDBTypography className="text-start">
        {"Pokud máte dotazy, kontaktujte nás na "}
        <a href="mailto:poradatel@ppvcup.cz">poradatel@ppvcup.cz</a>
        {"."}
      </MDBTypography>
    </MDBContainer>
  );
};

export default CookiePolicyPage;

