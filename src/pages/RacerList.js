import { useState, useEffect } from "react";
import {
  MDBContainer, MDBTable, MDBTableHead, MDBTableBody, MDBBadge, MDBInput,
  MDBTabs, MDBTabsItem, MDBTabsLink, MDBSpinner} from "mdb-react-ui-kit";
import {apiBaseUrl} from '../services/connection.js'

const RacerList = () => {
  const [loading, setLoading] = useState(true);
  const [racers, setRacers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    
    fetch(apiBaseUrl + '?action=racerlist&domain=ppvcup2024&limit=1000')
    .then((response) => {
        if (response.ok) {
            return response.json()
        } else {
            return { message: "Požadavek se nepodařilo odeslat", isError: true }
        }
    })
    .then((data) => {
      setLoading(false);
      if (!data.isError) {
        setRacers(JSON.parse(data.responseData));
      }
    })
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
          {loading ? (
              <MDBSpinner role="status" className="text-right my-4" style={{borderWidth: '4px'}}>
                <span className="visually-hidden">Načítám seznam...</span>
              </MDBSpinner>
          ) : (
              filteredRacers.map((racer, index) => (
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
            ))
          )}
        </MDBTableBody>
      </MDBTable>
    </MDBContainer>
  );
};

export default RacerList;