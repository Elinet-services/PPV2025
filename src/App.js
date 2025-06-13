import { useState, useEffect }  from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { MDBContainer,
  MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBAlert, MDBSpinner
} from 'mdb-react-ui-kit';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import Documents from './pages/Documents';
import Registration from './pages/Registration';
import RacerList from './pages/RacerList'; 
import EditNotes from './pages/EditNotes';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';

import {getRights, processRequest, resetCookies, setDomainName, setApiBaseUrl} from './services/connection.js';

const App = () => {
  const navigate = useNavigate();

  const [alertMessage, showAlerMessage] = useState(false);        //  zobrazeni responseMessage v MDBAlertu po volani DB
  const [loading, setLoading] = useState(false);  //  volani do DB
  const [error, setError] = useState(false);      //  volani do DB vratilo chybu
  const [responseMessage, setResponseMessage] = useState(''); //  textova zprava volani do DB

  const [userRights, setUserRights] = useState(getRights().split(',')); //  načtení práv uživatele z cookies
  const [userMenuItems, setUserMenuItems] = useState([]);               //  položky menu pro uživatele

  const configurationMap = {
      apiBaseUrl: setApiBaseUrl,
      domainName: setDomainName
  };
  //  načtení konfiguračního souboru
  useEffect(() => {
    fetch("../configuration.json")
      .then((res) => res.json())
      .then((configuration) => {
        configuration.forEach(obj => {
          Object.entries(obj).forEach(([key, value]) => {
            if (configurationMap.hasOwnProperty(key)) 
              configurationMap[key](value);
          });
        });
      });
  }, []);

  // Fetch user menu items based on user rights
  useEffect(() => {
    fetch("/userMenuItems.json")
      .then((res) => res.json())
      .then((data) => {
        // Filter items based on authentication status
        const filteredItems = data.filter(item => {
          if (userRights.indexOf(item.right) === -1) return false;  // User does not have the right          
          return true;
        });
        setUserMenuItems(filteredItems);
      });
  }, [userRights]);

  async function logout( ) {
    let response = await processRequest({}, 'logout', setLoading, setResponseMessage, setError, showAlerMessage);

    //  if (!response.isError) {
    resetCookies();
    setUserRights([]);
    navigate("/");
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
          delay={3000}
        >
          {responseMessage}
      </MDBAlert>

      {/* Záhlaví aplikace */}
      <Header userMenuItems={userMenuItems} logout={logout}/>

      {/* Hlavní obsah aplikace */}  
      <MDBContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/registration" element={<Registration setLoading={setLoading} setMessage={setResponseMessage} setError={setError} showAlerMessage={showAlerMessage}/>} />
          <Route path="/racerlist" element={<RacerList />} />
          <Route path="/notes" element={<EditNotes setLoading={setLoading} setMessage={setResponseMessage} setError={setError} showAlerMessage={showAlerMessage}/>} />
          <Route path="/login" element={<Login setLoading={setLoading} setMessage={setResponseMessage} setError={setError} showAlerMessage={showAlerMessage} setUserRights={setUserRights}/>} />
          <Route path="/resetpassword" element={<ResetPassword setLoading={setLoading} setMessage={setResponseMessage} setError={setError} showAlerMessage={showAlerMessage}/>} />
        </Routes>
      </MDBContainer>

      <Footer />  {/* Footer je také mimo Routes  */}
    </>
  )
};

export default App;