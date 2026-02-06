import { Link } from "react-router-dom";
import {
  MDBContainer,
  MDBTypography,
  MDBListGroup,
  MDBListGroupItem,
} from "mdb-react-ui-kit";

const GuidesPage = () => {
  return (
    <MDBContainer className="my-5">
      <MDBTypography tag="h4" className="mb-3 text-start">
        {"Nápověda"}
      </MDBTypography>

      <MDBTypography className="mb-4 text-start">
        {"Stručné návody k přihlášení, resetu hesla a editaci přihlášky."}{" "}
        {"Většina odkazů vás přesměruje na příslušnou stránku aplikace."}
      </MDBTypography>

      <MDBTypography tag="h5" className="mt-4 mb-2 text-start">
        {"1) Přihlášení"}
      </MDBTypography>
      <MDBListGroup className="mb-4">
        <MDBListGroupItem>
          {"Otevřete stránku "}
          <Link to="/login">{"Přihlášení"}</Link>
          {"."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          {"Zadejte e‑mail a heslo a klikněte na „Přihlásit“."}
        </MDBListGroupItem>
      </MDBListGroup>

      <MDBTypography tag="h5" className="mt-4 mb-2 text-start">
        {"2) Editace přihlášky závodníka (úprava přihlášky)"}
      </MDBTypography>
      <MDBListGroup className="mb-4">
        <MDBListGroupItem>
          {
            "Po přihlášení se v menu zobrazí položka „Editace přihlášky závodníka“."
          }
        </MDBListGroupItem>
        <MDBListGroupItem>
          {"Klikněte na ni, upravte údaje a změny uložte."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          {"Stránka editace je dostupná také přes "}
          <Link to="/registration">{"Registraci / Editaci přihlášky"}</Link>
          {" (po přihlášení)."}
        </MDBListGroupItem>
      </MDBListGroup>

      <MDBTypography tag="h5" className="mt-4 mb-2 text-start">
        {"3) Zapomenuté heslo (odeslání odkazu)"}
      </MDBTypography>
      <MDBListGroup className="mb-4">
        <MDBListGroupItem>
          {"Na stránce "}
          <Link to="/login">{"Přihlášení"}</Link>
          {" klikněte na „Zapomenuté heslo“."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          {"Zadejte e‑mail a klikněte na „Odeslat odkaz“."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          {"Do e‑mailu vám přijde zpráva s odkazem pro reset hesla."}
        </MDBListGroupItem>
      </MDBListGroup>

      <MDBTypography tag="h5" className="mt-4 mb-2 text-start">
        {"4) Reset hesla (nastavení nového hesla přes odkaz)"}
      </MDBTypography>
      <MDBListGroup className="mb-4">
        <MDBListGroupItem>
          {"Otevřete odkaz z e‑mailu (vede na stránku „Nastavení hesla“)."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          {"Zadejte nové heslo (min. 8 znaků) a potvrďte ho ve druhém poli."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          {"Klikněte na „Nastavit nové heslo“. Poté se vraťte na "}
          <Link to="/login">{"Přihlášení"}</Link>
          {" a přihlaste se novým heslem."}
        </MDBListGroupItem>
      </MDBListGroup>

      <MDBTypography tag="h5" className="mt-4 mb-2 text-start">
        {"5) Změna hesla po přihlášení"}
      </MDBTypography>
      <MDBListGroup className="mb-4">
        <MDBListGroupItem>
          {"Po přihlášení otevřete uživatelské menu a zvolte „Změna hesla“,"}
          {" nebo přejděte přímo na "}
          <Link to="/changepassword">{"Změnu hesla"}</Link>
          {"."}
        </MDBListGroupItem>
      </MDBListGroup>

      <MDBTypography tag="h5" className="mt-4 mb-2 text-start">
        {"Časté potíže (rychlá kontrola)"}
      </MDBTypography>
      <MDBListGroup>
        <MDBListGroupItem>
          {"E‑mail zadávejte bez mezer (ideálně malými písmeny)."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          {"Nové heslo musí mít minimálně 8 znaků a obě pole se musí shodovat."}
        </MDBListGroupItem>
        <MDBListGroupItem>
          {
            "Použijte nejnovější e‑mail s odkazem na reset hesla (starší odkaz může být neplatný)."
          }
        </MDBListGroupItem>
      </MDBListGroup>
    </MDBContainer>
  );
};

export default GuidesPage;
