import { useContext, useEffect, useState } from "react";
import { MDBWysiwyg } from "mdb-react-wysiwyg";
import { MDBBtn, MDBCheckbox, MDBCol, MDBContainer, MDBDatatable, MDBIcon, MDBInput, MDBRow } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

import { AppContext } from "../App";
import { processRequest } from "../services/connection";

const getNow = () => {
  const now = new Date();
  return `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} ${now.getHours()}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const Notes = () => {
  const app = useContext(AppContext);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    rowNr: 0,
    description: "",
    dateTime: getNow(),
    published: true,
    message: "",
  });

  const [documentList, setDocumentList] = useState({
    columns: [
      { label: t("backoffice.notes.row"), field: "rowNr", sort: true, width: 50 },
      { label: t("backoffice.notes.published"), field: "publishedIcon", sort: false, width: 50 },
      { label: t("backoffice.notes.datetime"), field: "dateTime", sort: false, width: 200 },
      { label: t("backoffice.notes.caption"), field: "description", sort: false, width: 500 },
    ],
    rows: [],
  });

  useEffect(() => {
    setDocumentList((previousState) => ({
      ...previousState,
      columns: [
        { label: t("backoffice.notes.row"), field: "rowNr", sort: true, width: 50 },
        { label: t("backoffice.notes.published"), field: "publishedIcon", sort: false, width: 50 },
        { label: t("backoffice.notes.datetime"), field: "dateTime", sort: false, width: 200 },
        { label: t("backoffice.notes.caption"), field: "description", sort: false, width: 500 },
      ],
    }));
  }, [t]);

  function fillDocumentList(responseData) {
    setDocumentList((previousState) => ({
      columns: previousState.columns,
      rows: responseData.notesArray.map((note) => ({
        ...note,
        rowNr: note.rowNr * 1,
        dateTime: note.date,
        description: note.header,
        published: note.published === "TRUE",
        publishedIcon:
          note.published === "TRUE" ? (
            <>
              <MDBIcon far icon="check-circle" className="datatable-disable-onclick" />
            </>
          ) : (
            ""
          ),
        message: decodeURIComponent(note.bodyText),
      })),
    }));
  }

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const response = await processRequest({}, "notelist", app.setLoading, app.setResponseMessage, app.setError, app.showAlerMessage);
        if (!response.isError && mounted) {
          fillDocumentList(JSON.parse(response.responseData));
        }
      } catch (err) {
        console.error("load notes error", err);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  function newNote(e) {
    if (e) e.preventDefault();
    setFormData({ rowNr: 0, dateTime: getNow(), description: "", published: true, message: "" });
    document.querySelector("#Editor .wysiwyg-content").innerHTML = "";
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckbox = () => {
    setFormData({ ...formData, published: !formData.published });
  };

  const handleEditorChange = (value) => {
    setFormData({ ...formData, message: value });
  };

  function decodeHTML(html) {
    const htmlEntityPattern = /&(?!nbsp;)[a-zA-Z0-9#]+;/;
    if (htmlEntityPattern.test(html)) {
      const parser = new DOMParser();
      return parser.parseFromString(html, "text/html").body.textContent;
    }
    return html;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      message: encodeURIComponent(decodeHTML(formData.message)),
    };
    const response = await processRequest(
      updatedFormData,
      "savenote",
      app.setLoading,
      app.setResponseMessage,
      app.setError,
      app.showAlerMessage
    );
    if (!response.isError) {
      fillDocumentList(JSON.parse(response.responseData));
      newNote();
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBDatatable
        data={documentList}
        pagination={false}
        maxHeight="350px"
        entries={9999}
        noFoundMessage={t("backoffice.notes.noDocumentFound")}
        allText={t("backoffice.notes.all")}
        rowsText={t("backoffice.notes.rows")}
        ofText={t("backoffice.notes.of")}
        hover
        bordered
        fixedHeader
        search
        striped
        sm
        onRowClick={(row) => {
          setFormData({
            rowNr: row.rowNr,
            dateTime: row.dateTime,
            description: row.description,
            published: row.published,
            message: row.message,
          });
          document.querySelector("#Editor .wysiwyg-content").innerHTML = row.message;
        }}
      />
      <MDBRow>
        <div className="p-3"></div>
      </MDBRow>
      <form onSubmit={handleSubmit}>
        <MDBRow>
          <MDBCol md="4">
            <MDBInput name="date" id="date" value={formData.dateTime} label={t("backoffice.notes.datetime")} disabled />
          </MDBCol>

          <MDBCol>
            <MDBBtn onClick={newNote}>{t("backoffice.notes.newMessage")}</MDBBtn>
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <div className="p-2"></div>
        </MDBRow>
        <MDBRow>
          <MDBCol md="10">
            <MDBInput
              name="description"
              id="description"
              onChange={handleChange}
              value={formData.description}
              label={t("backoffice.notes.caption")}
              required
            />
          </MDBCol>
          <MDBCol md="2">
            <MDBCheckbox id="published" label={t("backoffice.notes.publish")} checked={formData.published} onChange={handleCheckbox} />
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <div className="p-2"></div>
        </MDBRow>
        <MDBCol md="4">
          <MDBBtn type="submit" className="btn-block">
            {t("backoffice.notes.save")}
          </MDBBtn>
        </MDBCol>
      </form>
      <MDBWysiwyg id="Editor" onChange={handleEditorChange} />
    </MDBContainer>
  );
};

export default Notes;
