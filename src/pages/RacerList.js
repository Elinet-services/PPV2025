import { useState, useEffect } from "react";
import {
  MDBContainer,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBadge,
  MDBInput,
  
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
} from "mdb-react-ui-kit";

const RacerList = () => {
  const [racers, setRacers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchRacers = async () => {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycby7ANAR0E0geFDUp-Zi086Ie8KjFz7X5vcj1sQ4yIMg9yUDOPdd0LbyQYLqOs44aZxF/exec?action=racerlist&domain=ppvcup2024"
        );
        const data = await response.json();
        if (!data.isError && data.responseData) {
          const parsedData = JSON.parse(data.responseData);
          setRacers(parsedData);
        }
      } catch (error) {
        console.error("Chyba při načítání dat:", error);
      }
    };

    fetchRacers();
  }, []);

  const filteredRacers = racers
    .filter((racer) => {
      if (!racer.name || !racer.surname) return false;
      return Object.values(racer).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .filter((racer) => {
      switch (activeTab) {
        case "registered":
          return true;
        case "club":
          return racer.paymentDate && racer.gliderClass === "club";
        case "combi":
          return racer.paymentDate && racer.gliderClass === "combi";
        default:
          return true;
      }
    })
    .sort((a, b) => {
      const dateA = a.paymentDate ? new Date(a.paymentDate) : null;
      const dateB = b.paymentDate ? new Date(b.paymentDate) : null;

      if (dateA && dateB) {
        return dateA - dateB;
      } else if (!dateA && dateB) {
        return 1;
      } else if (dateA && !dateB) {
        return -1;
      }
      return racers.indexOf(a) - racers.indexOf(b);
    });

  return (
    <MDBContainer className="my-5">
      <h4 className="mb-4 text-center">Seznam závodníků</h4>
      <MDBInput
        className="mb-3"
        label="Vyhledávání"
        icon="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <MDBTabs className="mb-3">
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => setActiveTab("registered")}
            active={activeTab === "registered"}
          >
            Registrovaní
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => setActiveTab("club")}
            active={activeTab === "club"}
          >
            Klub
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => setActiveTab("combi")}
            active={activeTab === "combi"}
          >
            Kombi
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>

      <MDBTable align="middle" striped bordered small>
        <MDBTableHead dark>
          <tr>
            <th>#</th>
            <th>Jméno</th>
            <th>Příjmení</th>
            <th>Aeroklub</th>
            <th>Typ letadla</th>
            <th>Imatrikulace</th>
            <th style={{ textAlign: 'center' }}>Startovní znak</th>
            <th style={{ textAlign: 'center' }}>Třída</th>
            <th style={{ textAlign: 'center' }}>Datum platby</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {filteredRacers.map((racer, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{racer.name}</td>
              <td>{racer.surname}</td>
              <td>{racer.club}</td>
              <td>{racer.glider}</td>
              <td>{racer.imatriculation}</td>
              <td style={{ textAlign: 'center' }}>{racer.startCode || "-"}</td>
              <td style={{ textAlign: 'center' }}>
                <MDBBadge
                  color={racer.gliderClass === "club" ? "success" : "primary"}
                  pill
                >
                  {racer.gliderClass}
                </MDBBadge>
              </td>
              <td style={{ textAlign: 'center' }}>{racer.paymentDate ? racer.paymentDate : "-"}</td>
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
    </MDBContainer>
  );
};

export default RacerList;