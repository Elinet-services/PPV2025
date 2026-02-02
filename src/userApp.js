import { useContext, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { MDBContainer } from "mdb-react-ui-kit";

import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import DocumentList from "./pages/DocumentList.js";
import RacerListPage from "./pages/RacerListPage"; // ✅ místo ./pages/RacerList
import UserLogin from "./pages/UserLogin.js";
import UserRegistration from "./pages/UserRegistration.js";
import UserResetPassword from "./pages/UserResetPassword.js";
import UserChangePassword from "./pages/UserChangePassword";
import { AppContext } from "./App.js";
import { fetchData } from "./services/connection.js";

const UserApp = () => {
  const app = useContext(AppContext);
  const [documentList, setDocumentList] = useState([]);
  const [noteList, setNoteList] = useState([]);

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

      <MDBContainer>
        <Routes>
          <Route path="/" element={<HomePage noteList={noteList} />} />
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
      </MDBContainer>

      <Footer />
    </>
  );
};

export default UserApp;
