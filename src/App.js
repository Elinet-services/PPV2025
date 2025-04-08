import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './shared/components/Header';
import Footer from './shared/components/Footer';
import Actualities from './features/Actualities';
import Weather from './shared/components/Weather';
import Documents from './shared/components/Documents';
import Registration from './shared/components/Registration';
import RacerList from './shared/components/RacerList'; 
import Editor from './shared/components/Editor';
import Login from './shared/components/Login';
import Logout from './shared/components/Logout';
import ResetPassword from './shared/components/ResetPassword';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';

const App = () => (
  <Router> 
    <Header />  {/* Header je mimo Routes = bude všude */}
    
    <MDBContainer className="my-4">
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
        <Route path="/registration" element={<Registration />} />
        <Route path="/racerlist" element={<RacerList />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
      </Routes>
    </MDBContainer>

    <Footer /> {/* Footer je také mimo Routes */}
  </Router>
);

export default App;