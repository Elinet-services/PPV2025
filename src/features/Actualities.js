import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { MDBListGroup, MDBListGroupItem, MDBTypography } from "mdb-react-ui-kit";

const REGISTRATION_OPEN_DATE = new Date(2025, 1, 7, 18, 59, 59);
const API_URL =
  "https://script.google.com/macros/s/AKfycby7ANAR0E0geFDUp-Zi086Ie8KjFz7X5vcj1sQ4yIMg9yUDOPdd0LbyQYLqOs44aZxF/exec?action=racerlist&domain=ppvcup2024";

const Actualities = () => {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [registrationStarted, setRegistrationStarted] = useState(false);
  const [racerCount, setRacerCount] = useState(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = REGISTRATION_OPEN_DATE - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeRemaining(`${days} dní ${hours} hodin ${minutes} minut ${seconds} sekund`);
      } else {
        setRegistrationStarted(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRacerCount = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("❌ Chyba při načítání API.");

        const data = await response.json();
        const parsedData = JSON.parse(data.responseData);
        setRacerCount(parsedData.length);
      } catch (error) {
        console.error("❌ Chyba při načítání počtu závodníků:", error);
        setRacerCount(null);
      }
    };

    fetchRacerCount();
    const interval = setInterval(fetchRacerCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const capacity = 65;
  const reserveSpots = 10;
  const totalCapacity = capacity + reserveSpots;
  const remainingSpots = racerCount !== null ? totalCapacity - racerCount : null;

  const staticActualities = [
    {
      date: "6.2.2025",
      time: "19:00",
      header: "Spuštění registrace závodníků na PPV2025",
      bodyText: registrationStarted ? (
        <div>
          <p>Registrace byla spuštěna a registrovat se můžete zde:</p>
          <NavLink to="/registration" style={{ textDecoration: "none" }}>
            <button
              style={{
                marginLeft: "10px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Registrovat závodníka
            </button>
          </NavLink>
          <hr />
          <p>
            <b>V tuto chvíli je do soutěže přihlášeno {racerCount ?? "?"} závodníků.</b>
          </p>
          <p>
            Kapacita závodu je {capacity} soutěžících + {reserveSpots} náhradníků, zbývá tak ještě{" "}
            <b>{remainingSpots ?? "?"}</b> míst.
          </p>
          <p>Neváhejte s registrací.</p>
        </div>
      ) : (
        <div>
          <p>
            Registrace do letošního ročníku PPV 2025 bude otevřena v <b>pátek 7. února v 19.00 hodin</b>.
          </p>
          <p>
            Do spuštění rezervace zbývá: <b>{timeRemaining}</b>
          </p>
          <p>
            V případě jakýchkoli problémů s registrací pošlete informaci mailem na adresu:{" "}
            <a href="mailto:jiri.janda@elinet.cz">jiri.janda@elinet.cz</a>.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div id="actualities">
      <MDBTypography tag="h4">Aktuality</MDBTypography>
      <MDBListGroup>
        {staticActualities.map(({ header, bodyText }, index) => (
          <MDBListGroupItem key={index}>
            <h6>
              <b>{header}</b>
            </h6>
            {bodyText}
          </MDBListGroupItem>
        ))}
      </MDBListGroup>
    </div>
  );
};

export default Actualities;
