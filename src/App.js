import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBAlert, MDBSpinner
} from 'mdb-react-ui-kit';

import UserApp from './userApp';
import BackofficeApp from './backofficeApp.js';
import {getRights, processRequest, resetCookies, setDomainName, setApiBaseUrl, apiBaseUrl} from './services/connection.js';

export const AppContext = React.createContext(null);

const App = () => {
  const [loading, setLoading] = useState(false);              //  volani do DB
  const [alertMessage, showAlerMessage] = useState(false);    //  zobrazeni responseMessage v MDBAlertu po volani DB
  const [error, setError] = useState(false);                  //  volani do DB vratilo chybu
  const [responseMessage, setResponseMessage] = useState(''); //  textova zprava volani do DB
  const [userRights, setUserRights] = useState(getRights().split(',')); //  načtení práv uživatele z cookies
  const [apiBaseUrlState, setApiBaseUrlState] = useState(''); // nový stav pro apiBaseUrl

  //  načtení konfiguračního souboru
  useEffect(() => {
    fetch("../configuration.json")
      .then((res) => res.json())
      .then((cfg) => {
        // naplnit konfiguraci
        cfg.forEach(obj => 
          Object.entries(obj).forEach(([key, value]) => {
            if (key === 'apiBaseUrl') {
              setApiBaseUrl(value);
              setApiBaseUrlState(value); // aktualizovat lokální stav
            }
            if (key === 'domainName') setDomainName(value);
        }));

      }).catch(()=>{});
  }, []);

  async function logout( ) {
    let response = await processRequest({}, 'logout', setLoading, setResponseMessage, setError, showAlerMessage);

    //  if (!response.isError) {
    resetCookies();
    setUserRights([]);
    //  navigate("/");
  };
  
  return (
    <>   
      {/* Odeslani do DB */}
      <MDBModal open={loading} tabIndex='-1' staticBackdrop>
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Odesílání do DB</MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody>
              <div className='text-center'>
                <MDBSpinner role='status'/>
              </div>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* zobrazeni responseMessage */}
      <MDBAlert open={alertMessage}
          onClose={() => showAlerMessage(false)}
          color={error ? 'danger':'success'}
          autohide appendToBody
          position='top-center'
          width={800}
          delay={error ? 5000: 3000}
        >
          {responseMessage}
      </MDBAlert>

      <AppContext.Provider value={{
        loading, setLoading,
        alertMessage, showAlerMessage,
        error, setError,
        userRights, setUserRights,
        setResponseMessage,
        apiBaseUrlState,
        logout, processRequest
      }}>
        <Routes>
          <Route path="/backoffice/*" element={<BackofficeApp />} />
          <Route path="/*" element={<UserApp />} />
        </Routes>
      </AppContext.Provider>
    </>
  )
};

export default App;