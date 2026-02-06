import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MDBContainer,
  MDBInput,
  MDBTypography,
  MDBListGroup,
  MDBListGroupItem,
} from "mdb-react-ui-kit";

const GuidesPage = () => {
  const [query, setQuery] = useState("");

  const blocks = useMemo(
    () => [
      {
        id: "login",
        title: "Přihlášení",
        items: [
          <>
            {"Otevřete stránku "}
            <Link to="/login">{"Přihlášení"}</Link>
            {"."}
          </>,
          "Zadejte e‑mail a heslo a klikněte na „Přihlásit“.",
        ],
      },
      {
        id: "editace",
        title: "Editace přihlášky závodníka",
        items: [
          "Po přihlášení se v menu zobrazí položka „Editace přihlášky závodníka“.",
          "Klikněte na ni, upravte údaje a změny uložte.",
          <>
            {"Stránka editace je dostupná také přes "}
            <Link to="/registration">{"Registraci / Editaci přihlášky"}</Link>
            {" (po přihlášení)."}
          </>,
        ],
      },
      {
        id: "zapomenute",
        title: "Zapomenuté heslo (odeslání odkazu)",
        items: [
          <>
            {"Na stránce "}
            <Link to="/login">{"Přihlášení"}</Link>
            {" klikněte na „Zapomenuté heslo“."}
          </>,
          "Zadejte e‑mail a klikněte na „Odeslat odkaz“.",
          "Do e‑mailu vám přijde zpráva s odkazem pro reset hesla.",
        ],
      },
      {
        id: "reset",
        title: "Reset hesla (nastavení nového hesla)",
        items: [
          "Otevřete odkaz z e‑mailu (vede na stránku „Nastavení hesla“).",
          "Zadejte nové heslo (min. 8 znaků) a potvrďte ho ve druhém poli.",
          <>
            {"Klikněte na „Nastavit nové heslo“. Poté se vraťte na "}
            <Link to="/login">{"Přihlášení"}</Link>
            {" a přihlaste se novým heslem."}
          </>,
        ],
      },
      {
        id: "zmena",
        title: "Změna hesla po přihlášení",
        items: [
          <>
            {
              "Po přihlášení otevřete uživatelské menu a zvolte „Změna hesla“, nebo přejděte přímo na "
            }
            <Link to="/changepassword">{"Změnu hesla"}</Link>
            {"."}
          </>,
        ],
      },
      {
        id: "potize",
        title: "Časté potíže (rychlá kontrola)",
        items: [
          "E‑mail zadávejte bez mezer (ideálně malými písmeny).",
          "Nové heslo musí mít minimálně 8 znaků a obě pole se musí shodovat.",
          "Použijte nejnovější e‑mail s odkazem na reset hesla (starší odkaz může být neplatný).",
        ],
      },
    ],
    []
  );

  const visibleBlocks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blocks;

    return blocks.filter((block) => {
      const haystack = [
        block.title,
        ...block.items.map((item) => (typeof item === "string" ? item : "")),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [blocks, query]);

  return (
    <MDBContainer className="my-5">
      <MDBTypography className="mb-4 text-start">
        {"Stručné návody k přihlášení, resetu hesla a editaci přihlášky. "}
        {"Většina odkazů vás přesměruje na příslušnou stránku aplikace."}
      </MDBTypography>

      <MDBTypography className="mb-4 text-start">
        {"Pokud bude v nápovědě něco chybět nebo něco nebude fungovat, kontaktujte nás na "}
        <a href="mailto:poradatel@ppvcup.cz">poradatel@ppvcup.cz</a>
        {"."}
      </MDBTypography>

      <div className="mb-4">
        <MDBInput
          label="Vyhledat v nápovědě"
          aria-label="Vyhledat v nápovědě"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visibleBlocks.length === 0 ? (
        <MDBTypography className="text-start">
          {"Nic nenalezeno. Zkuste jiné heslo (např. „heslo“, „reset“, „editace“). "}
          {"Případně nám napište na "}
          <a href="mailto:poradatel@ppvcup.cz">poradatel@ppvcup.cz</a>
          {"."}
        </MDBTypography>
      ) : (
        visibleBlocks.map((block) => (
          <div key={block.id} className="mb-4">
            <MDBTypography tag="h5" className="mt-4 mb-2 text-start">
              {block.title}
            </MDBTypography>
            <MDBListGroup className="mb-2">
              {block.items.map((item, index) => (
                <MDBListGroupItem key={index}>
                  {typeof item === "string" ? item : item}
                </MDBListGroupItem>
              ))}
            </MDBListGroup>
          </div>
        ))
      )}
    </MDBContainer>
  );
};

export default GuidesPage;
