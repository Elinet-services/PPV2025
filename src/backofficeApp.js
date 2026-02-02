import { useContext, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { MDBContainer } from "mdb-react-ui-kit";

import DocumentList from "./pages/DocumentList.js";
import RacerListPage from "./pages/RacerListPage.js"; // ✅ FIX: místo ./pages/RacerList.js
import EditNotes from "./pages/EditNotes.js";
import UserLogin from "./pages/UserLogin.js";
import Header from "./components/BackofficeHeader.js";
import Footer from "./components/BackofficeFooter.js";
import { AppContext } from "./App.js";

const BackofficeApp = () => {
  const app = useContext(AppContext);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    fetch("/backofficeMenuItems.json")
      .then((res) => res.json())
      .then((data) => {
        const filteredItems = data.filter((item) => {
          if (item.addDivider) return true;
          if (app.userRights.indexOf(item.right) === -1) return false;
          return true;
        });
        setMenuItems(filteredItems);
      })
      .catch(() => setMenuItems([]));
  }, [app.userRights]);

  return (
    <>
      <Header menuItems={menuItems} logout={app.logout} />

      <MDBContainer>
        <Routes>
          <Route path="documents" element={<DocumentList />} />
          <Route path="racerlist" element={<RacerListPage />} /> {/* ✅ FIX */}
          <Route path="notes" element={<EditNotes />} />
          <Route
            path="login"
            element={
              <UserLogin
                setLoading={app.setLoading}
                setMessage={app.setResponseMessage}
                setError={app.setError}
                showAlerMessage={app.showAlerMessage}
                setUserRights={app.setUserRights}
              />
            }
          />
        </Routes>
      </MDBContainer>

      <Footer />
    </>
  );
};

export default BackofficeApp;
