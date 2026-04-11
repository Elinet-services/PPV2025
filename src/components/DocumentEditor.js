import { useState, useEffect } from "react";
import {
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
  MDBInput,
  MDBCheckbox,
  MDBTextArea,
  MDBFile
} from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";
import { formatDate } from "../services/connection";

const DocumentEditor = ({ show, initialData, onClose, onSave }) => {
  const { t } = useTranslation();

  const [dateInserted, setDateInserted] = useState("");
  const [docName, setDocName] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [row, setRow] = useState(null);
  const [fileId, setFileId] = useState("");
  const [fileMeta, setFileMeta] = useState({ filename: "", mimeType: "", size: 0, base64: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDateInserted(initialData.dateInserted || "");
      setDocName(initialData.docName || "");
      setDescription(initialData.description || "");
      setPublished(!!initialData.published);
      setRow(initialData.row || null);
      setFileId(initialData.fileId || "");
      setFileMeta({ filename: initialData.filename || "", mimeType: "", size: 0, base64: null });
    } else {
      setDateInserted(formatDate(new Date()));
      setDocName("");
      setDescription("");
      setPublished(false);
      setRow(null);
      setFileId("");
      setFileMeta({ filename: "", mimeType: "", size: 0, base64: null });
    }
  }, [initialData, show]);

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setFileMeta({ filename: "", mimeType: "", size: 0, base64: null });
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      setFileMeta({ filename: file.name, mimeType: file.type || "", size: file.size, base64: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  function resetLocalState() {
    setDocName("");
    setDescription("");
    setPublished(false);
    setRow(null);
    setFileId("");
    setFileMeta({ filename: "", mimeType: "", size: 0, base64: null });
    setSaving(false);
  }

  function handleClose() {
    // vyčistit lokální stav a zavřít modal bez uložení
    resetLocalState();
    if (onClose) onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      row: row ? Number(row) : null,
      filename: fileMeta.filename || "",
      fileBase64: fileMeta.base64 ? fileMeta.base64 : null,
      mimeType: fileMeta.mimeType || "",
      size: fileMeta.size || 0,
      docName,
      description,
      published,
      fileId: fileId || "",
    };

    setSaving(true);
    try {
      await onSave(payload);
      // po úspěšném uložení vyčistíme lokální stav (parent zavře modal)
      resetLocalState();
    } finally {
      setSaving(false);
    }
  }

  return (
    <MDBModal open={show} onClose={handleClose} >
      <MDBModalDialog size="lg">
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>{row ? t("documents.editDocument") : t("documents.newDocument")}</MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={handleClose}></MDBBtn>
          </MDBModalHeader>
          <form onSubmit={handleSubmit}>
            <MDBModalBody>
              <MDBInput
                label={t("documents.inserted")}
                value={dateInserted}
                disabled
                className="mb-3"
              />
              <MDBFile 
                label={t("documents.fileName") +": " + (fileMeta.filename ? `${fileMeta.filename}` : "")}
                onChange={handleFileChange}
                required={!row} // při editaci není soubor povinný, při vytváření ano
                className="form-control mb-3"
              />
              <MDBInput
                label={t("documents.name")}
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="mb-3"
              />
              <MDBTextArea
                rows={4}
                label={t("documents.description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mb-3"
              />
              <div className="mb-3">
                <MDBCheckbox
                  name="published"
                  id="published"
                  label={t("backoffice.notes.publish") || "Publikovat"}
                  checked={published}
                  onChange={() => setPublished(!published)}
                />
              </div>
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" type="button" onClick={handleClose} disabled={saving}>
                Zpět
              </MDBBtn>
              <MDBBtn color="success" type="submit" disabled={saving}>
                {saving ? "Ukládám..." : "Uložit změny"}
              </MDBBtn>
            </MDBModalFooter>
          </form>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
};

export default DocumentEditor;