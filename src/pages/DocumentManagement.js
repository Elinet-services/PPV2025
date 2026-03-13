import React, { useState, useEffect, useContext } from "react";
import {
  MDBContainer,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBBadge,
  MDBSpinner,
} from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

import { fetchData, processRequest, formatDate } from "../services/connection";
import DocumentEditor from "../components/DocumentEditor.js";
import { AppContext } from "../App";

const DocumentManagement = () => {
  const { t } = useTranslation();
  const {
    setLoading,
    setResponseMessage,
    setError,
    showAlerMessage,
  } = useContext(AppContext);

  const [documents, setDocuments] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDocuments() {
    setLoading(true);
    setLoadingLocal(true);
    try {
      // admin view: request all documents (server requires token which fetchData appends)
      const res = await fetchData("documentlist", "&alldocuments=1", true);
      if (!res || res.isError) {
        setError(true);
        setResponseMessage(res?.message || t("documents.loading"));
        showAlerMessage(true);
        setDocuments([]);
      } else {
        // responseData can be stringified JSON or object
        let list = [];
        if (typeof res.responseData === "string") list = JSON.parse(res.responseData || "[]");
        else if (Array.isArray(res.responseData)) list = res.responseData;
        else if (res.responseData && res.responseData.documentList) list = res.responseData.documentList;
        else list = res.responseData || [];

        setDocuments(list);
      }
    } catch (e) {
      setError(true);
      setResponseMessage(t("documents.loading"));
      showAlerMessage(true);
    } finally {
      setLoading(false);
      setLoadingLocal(false);
    }
  }

  function openNew() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(doc) {
    setEditing(doc);
    setEditorOpen(true);
  }

  async function handleSave(formData) {
    const res = await processRequest(
      formData,
      "savedocument",
      setLoading,
      setResponseMessage,
      setError,
      showAlerMessage
    );

    if (!res.isError) {
      // server returns updated list in responseData.documentList (or responseData as array/string)
      let list = [];
      if (res.responseData && res.responseData.documentList) list = res.responseData.documentList;
      else if (typeof res.responseData === "string") list = JSON.parse(res.responseData || "[]");
      else if (Array.isArray(res.responseData)) list = res.responseData;
      else list = res.responseData || [];
      setDocuments(list);
      setEditorOpen(false); // zavřít modal pouze při úspěchu
    }
  }    
  
  return (
    <MDBContainer className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <MDBBtn color="primary" onClick={openNew}>
            {t("documents.newDocument")}
          </MDBBtn>
        </div>
      </div>

      {loadingLocal ? (
        <div className="text-center my-4">
          <MDBSpinner role="status" />
        </div>
      ) : (
        <MDBTable bordered hover>
          <MDBTableHead>
            <tr>
              <th>{t("documents.fileName")}</th>
              <th>{t("documents.name")}</th>
              <th>{t("documents.inserted")}</th>
              <th>{t("documents.published")}</th>
              <th>{t("documents.action")}</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {documents.map((d, idx) => (
              <tr key={idx}>
                <td>{d.filename}</td>
                <td>{d.docName}</td>
                <td>{d.dateInserted}</td>
                <td>
                  {d.published ? (
                    <MDBBadge color="success">Ano</MDBBadge>
                  ) : (
                    <MDBBadge color="secondary">Ne</MDBBadge>
                  )}
                </td>
                <td>
                  <MDBBtn size="sm" color="info" onClick={() => openEdit(d)} className="me-2">
                    Edit
                  </MDBBtn>
                  {d.fileId ? (
                    <MDBBtn
                      size="sm"
                      color="primary"
                      tag="a"
                      href={`https://drive.google.com/uc?export=download&id=${d.fileId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("documents.download")}
                    </MDBBtn>
                  ) : null}
                </td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      )}

      <DocumentEditor
        show={editorOpen}
        initialData={editing}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </MDBContainer>
  );
};

export default DocumentManagement;