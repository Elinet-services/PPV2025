import { useContext, useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { MDBContainer } from "mdb-react-ui-kit";

import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import { AppContext } from "./App.js";
import { fetchData } from "./services/connection.js";

const HomePage = lazy(() => import("./pages/HomePage"));
const DocumentList = lazy(() => import("./pages/DocumentList.js"));
const RacerListPage = lazy(() => import("./pages/RacerListPage"));
const GuidesPage = lazy(() => import("./pages/GuidesPage.js"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage.js"));
const UserLogin = lazy(() => import("./pages/UserLogin.js"));
const UserRegistration = lazy(() => import("./pages/UserRegistration.js"));
const UserResetPassword = lazy(() => import("./pages/UserResetPassword.js"));
const UserChangePassword = lazy(() => import("./pages/UserChangePassword"));

const UserApp = () => {
  const app = useContext(AppContext);
  const location = useLocation();
  const [documentList, setDocumentList] = useState([]);
  const [noteList, setNoteList] = useState([]);
  const isHome = location.pathname === "/" || location.pathname === "";

  useEffect(() => {
    let mounted = true;

    async function loadAllData() {
      if (!app.apiBaseUrlState) return;

      try {
        // ✅ racerlist už ne – to řeší RacerListPage (caching + refresh)
        const [notes, documents] = await Promise.all([
          fetchData("notes"),
          fetchData("documentlist"),
        ]);

        if (!mounted) return;

        if (!notes.isError) setNoteList(notes.data);
        if (!documents.isError) setDocumentList(documents.data);
      } catch (err) {
        console.error("load data error", err);
      }
    }

    loadAllData();

    return () => {
      mounted = false;
    };
  }, [app.apiBaseUrlState]);

  return (
    <>
      <Header />

      <MDBContainer className={`content-container ${isHome ? "has-logos" : "no-logos"}`}>
        <Suspense fallback={<LoadingSpinner className="my-5" height="100px" />}>
          <Routes>
            <Route path="/" element={<HomePage noteList={noteList} />} />
            <Route path="/navody" element={<GuidesPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route
              path="/documents"
              element={<DocumentList documentList={documentList} />}
            />

            {/* ✅ stránka se seznamem závodníků */}
            <Route path="/racerlist" element={<RacerListPage />} />

            <Route
              path="/login"
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
            <Route
              path="/registration"
              element={
                <UserRegistration
                  setLoading={app.setLoading}
                  setMessage={app.setResponseMessage}
                  setError={app.setError}
                  showAlerMessage={app.showAlerMessage}
                />
              }
            />
            <Route
              path="/resetpassword"
              element={
                <UserResetPassword
                  setLoading={app.setLoading}
                  setMessage={app.setResponseMessage}
                  setError={app.setError}
                  showAlerMessage={app.showAlerMessage}
                />
              }
            />
            <Route
              path="/changepassword"
              element={
                <UserChangePassword
                  setLoading={app.setLoading}
                  setMessage={app.setResponseMessage}
                  setError={app.setError}
                  showAlerMessage={app.showAlerMessage}
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

export default UserApp;







