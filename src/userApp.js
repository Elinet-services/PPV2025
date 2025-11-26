import { useContext, useState, useEffect }  from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { MDBContainer} from 'mdb-react-ui-kit';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DocumentList from './pages/DocumentList.js';
import RacerList from './pages/RacerList'; 
import EditNotes from './pages/EditNotes';
import UserLogin from './pages/UserLogin.js';
import UserRegistration from './pages/UserRegistration.js';
import UserResetPassword from './pages/UserResetPassword.js';
import UserChangePassword from './pages/UserChangePassword';
import { AppContext } from './App.js';
import {apiBaseUrl, fetchData} from './services/connection.js';

const UserApp = () => {
  const app = useContext(AppContext);
  const [documentList, setDocumentList] = useState([]);
  const [noteList, setNoteList] = useState([]);

  useEffect(() => {
    let mounted = true; // ochrana proti setState po unmountu
    const loadData = async () => {
      if (!app.apiBaseUrlState) return;
      try {
        const response = await fetchData('getall', '&limit=1000');
        if (!response.isError && mounted) {
          setNoteList(response.responseData.noteList.reverse());
          setDocumentList(response.responseData.documentList);
        }
      } catch (err) {
        console.error('load notes error', err);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [app.apiBaseUrlState]);   

  return (
    <>   
      {/* Záhlaví aplikace */}
      <Header/>

      {/* Hlavní obsah aplikace */}  
      <MDBContainer>
        <Routes>
          <Route path="/" element={<HomePage noteList={noteList}/>} />
          <Route path="/documents" element={<DocumentList documentList={documentList}/>} />
          <Route path="/racerlist" element={<RacerList />} />
          <Route path="/notes" element={<EditNotes setLoading={app.setLoading} setMessage={app.setResponseMessage} setError={app.setError} showAlerMessage={app.showAlerMessage}/>} />
          <Route path="/login" element={<UserLogin setLoading={app.setLoading} setMessage={app.setResponseMessage} setError={app.setError} showAlerMessage={app.showAlerMessage} setUserRights={app.setUserRights}/>} />
          <Route path="/registration" element={<UserRegistration setLoading={app.setLoading} setMessage={app.setResponseMessage} setError={app.setError} showAlerMessage={app.showAlerMessage}/>} />
          <Route path="/resetpassword" element={<UserResetPassword setLoading={app.setLoading} setMessage={app.setResponseMessage} setError={app.setError} showAlerMessage={app.showAlerMessage}/>} />
          <Route path="/changepassword" element={<UserChangePassword setLoading={app.setLoading} setMessage={app.setResponseMessage} setError={app.setError} showAlerMessage={app.showAlerMessage}/>} />
        </Routes>
      </MDBContainer>

      <Footer />  {/* Footer je také mimo Routes  */}
    </>
  )
};

export default UserApp;