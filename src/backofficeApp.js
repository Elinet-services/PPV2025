import { useContext, useState, useEffect }  from 'react';
import { Routes, Route } from 'react-router-dom';
import { MDBContainer } from 'mdb-react-ui-kit';

import DocumentList from './pages/DocumentList.js';
import RacerList from './pages/RacerList.js'; 
import EditNotes from './pages/EditNotes.js';
import UserLogin from './pages/UserLogin.js';
import Header from './components/BackofficeHeader.js';
import Footer from './components/BackofficeFooter.js';
import { AppContext } from './App.js';

const BackofficeApp = () => {
  const app = useContext(AppContext);

  const [menuItems, setMenuItems] = useState([]);               //  položky menu pro uživatele

  // Fetch user menu items based on user rights
  useEffect(() => {
    fetch("/backofficeMenuItems.json")
      .then((res) => res.json())
      .then((data) => {        
        // Filter items based on authentication status
        const filteredItems = data.filter(item => {
          if (item.addDivider) return true; // oddelovac
          if (app.userRights.indexOf(item.right) === -1) return false;  // User does not have the right          
          return true;
        });
        setMenuItems(filteredItems);
      });
  }, [app.userRights]);

  return (
    <>   
      <Header menuItems={menuItems} logout={app.logout} />
      {/* Hlavní obsah aplikace */}  
      <MDBContainer>
        <Routes>
          <Route path="documents" element={<DocumentList />} />
          <Route path="racerlist" element={<RacerList />} />
          <Route path="notes" element={<EditNotes />} />
          <Route path="login" element={<UserLogin setLoading={app.setLoading} setMessage={app.setResponseMessage} setError={app.setError} showAlerMessage={app.showAlerMessage} setUserRights={app.setUserRights}/>} />
        </Routes>
      </MDBContainer>

      <Footer />
    </>
  )
};

export default BackofficeApp;