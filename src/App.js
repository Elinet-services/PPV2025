import React, { useState }  from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './shared/components/Header';
import Footer from './shared/components/Footer';
import Actualities from './features/Actualities';
import Weather from './shared/components/Weather';
import Documents from './shared/components/Documents';
import Registration from './shared/components/Registration';
import RacerList from './shared/components/RacerList'; 
import Notes from './shared/components/Notes';
import Login from './shared/components/Login';
import Logout from './shared/components/Logout';
import ResetPassword from './shared/components/ResetPassword';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { MDBContainer, MDBRow, MDBCol,
  MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBAlert, MDBSpinner 
} from 'mdb-react-ui-kit';

const App = () => {
  const [alertMessage, showAlerMessage] = useState(false);        //  zobrazeni responseMessage v MDBAlertu po volani DB
  const [loading, setLoading] = useState(false);  //  volani do DB
  const [error, setError] = useState(false);      //  volani do DB vratilo chybu
  const [responseMessage, setResponseMessage] = useState(''); //  textova zprava volani do DB
  
  return (
  <Router>
  <MDBContainer>
      <Header />  {/* Header je mimo Routes = bude všude */}
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
    </MDBContainer>
    
    <MDBContainer>
      <Routes>
        <Route path="/" element={
          <MDBRow>
            <MDBCol md="8">
              <Actualities />
            </MDBCol>
            <MDBCol md="4">
              <Weather />
            </MDBCol>
          </MDBRow>
        } />
        <Route path="/documents" element={<Documents />} />
        <Route path="/registration" element={<Registration setLoading={setLoading} setMessage={setResponseMessage} setError={setError} showAlerMessage={showAlerMessage}/>} />
        <Route path="/racerlist" element={<RacerList />} />
        <Route path="/notes" element={<Notes setLoading={setLoading} setMessage={setResponseMessage} setError={setError} showAlerMessage={showAlerMessage}/>} />
        <Route path="/login" element={<Login setLoading={setLoading} setMessage={setResponseMessage} setError={setError} showAlerMessage={showAlerMessage}/>} />
        <Route path="/logout" element={<Logout setLoading={setLoading} setMessage={setResponseMessage} setError={setError} showAlerMessage={showAlerMessage}/>} />
        <Route path="/resetpassword" element={<ResetPassword setLoading={setLoading} setMessage={setResponseMessage} setError={setError} showAlerMessage={showAlerMessage}/>} />
      </Routes>
    </MDBContainer>

    <Footer /> {/* Footer je také mimo Routes */}
  </Router>
)
};

export default App;