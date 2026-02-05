import { useContext, useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { MDBContainer, MDBSpinner } from "mdb-react-ui-kit";

import Header from "./components/BackofficeHeader.js";
import Footer from "./components/BackofficeFooter.js";
import { AppContext } from "./App.js";

const DocumentList = lazy(() => import("./pages/DocumentList.js"));
const RacerListPage = lazy(() => import("./pages/RacerListPage.js"));
const EditNotes = lazy(() => import("./pages/EditNotes.js"));
const UserLogin = lazy(() => import("./pages/UserLogin.js"));

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

      <MDBContainer className="content-container no-logos">
        <Suspense fallback={<div className="text-center my-5"><MDBSpinner role="status" /></div>}>
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
        </Suspense>
      </MDBContainer>

      <Footer />
    </>
  );
};

export default BackofficeApp;


