import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBAlert,
  MDBSpinner,
} from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

import UserApp from "./userApp";
import BackofficeApp from "./backofficeApp.js";
import CookieConsent from "./components/CookieConsent";
import {
  getRights,
  processRequest,
  resetCookies,
  setDomainName,
  setApiBaseUrl,
  setApiBaseUrlGet,
} from "./services/connection.js";

export const AppContext = React.createContext(null);

const App = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [alertMessage, showAlerMessage] = useState(false);
  const [error, setError] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [userRights, setUserRights] = useState(getRights().split(","));
  const [apiBaseUrlState, setApiBaseUrlState] = useState(false);

  const navigate = useNavigate();
  const registrationToken = new URLSearchParams(useLocation().search).get(
    "registrationsubmittoken"
  );

  // ✅ načtení konfiguračního souboru (z public/) – absolutní cesta kvůli routám
  useEffect(() => {
    fetch("/configuration.json")
      .then((res) => res.json())
      .then((cfg) => {
        cfg.forEach((obj) =>
          Object.entries(obj).forEach(([key, value]) => {
            if (key === "apiBaseUrl") setApiBaseUrl(value);
            if (key === "apiBaseUrlGet") setApiBaseUrlGet(value);
            if (key === "domainName") setDomainName(value);
          })
        );
        setApiBaseUrlState(true);
      })
      .catch(() => {});
  }, []);

  // pokud přišel registrationsubmittoken v URL zavolat potvrzeni registrace
  useEffect(() => {
    if (!registrationToken || !apiBaseUrlState) return;

    let mounted = true;

    const submitRegistration = async () => {
      try {
        await processRequest(
          { token: registrationToken },
          "registrationsubmit",
          setLoading,
          setResponseMessage,
          setError,
          showAlerMessage
        );
      } catch (e) {
        console.error("registrationsubmit error", e);
      }
    };

    if (mounted) submitRegistration();
    return () => {
      mounted = false;
    };
  }, [apiBaseUrlState, registrationToken]);

  // ✅ odhlášení uživatele (uklizené)
  async function logout() {
    try {
      await processRequest(
        {},
        "logout",
        setLoading,
        setResponseMessage,
        setError,
        showAlerMessage
      );
    } catch (e) {
      console.error("logout error", e);
    } finally {
      resetCookies();
      setUserRights([]);
      navigate("/");
    }
  }

  return (
    <>
      {/* Odeslani do DB */}
      <MDBModal open={loading} tabIndex="-1" staticBackdrop>
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{t("app.sendingToDb")}</MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody>
              <div className="text-center">
                <MDBSpinner role="status" />
              </div>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* zobrazeni responseMessage */}
      <MDBAlert
        open={alertMessage}
        onClose={() => showAlerMessage(false)}
        color={error ? "danger" : "success"}
        autohide
        appendToBody
        position="top-center"
        width={800}
        delay={error ? 5000 : 3000}
      >
        {responseMessage}
      </MDBAlert>

      <AppContext.Provider
        value={{
          loading,
          setLoading,
          alertMessage,
          showAlerMessage,
          error,
          setError,
          userRights,
          setUserRights,
          setResponseMessage,
          apiBaseUrlState,
          logout,
          processRequest,
        }}
      >
        <CookieConsent />
        <Routes>
          <Route path="/backoffice/*" element={<BackofficeApp />} />
          <Route path="/*" element={<UserApp />} />
        </Routes>
      </AppContext.Provider>
    </>
  );
};

export default App;
