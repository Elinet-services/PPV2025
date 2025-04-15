import { useState, useEffect, useRef } from 'react';
import { MDBWysiwyg } from 'mdb-react-wysiwyg';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBInput,
  MDBDatatable
} from "mdb-react-ui-kit";
import processRequest, {apiBaseUrl} from './connection.js';

const getNow = () => {
  const now = new Date();
  return now.getDate() +'.'+ (now.getMonth() + 1) +'.'+ now.getFullYear() +' '+ now.getHours() +':'+ now.getMinutes().toString().padStart(2,'0');
}

const Notes = (params) => {
  const [loading, setLoading] = useState(true);  //  volani do DB
  const [formData, setFormData] = useState({
    rowNr: 0,
    description: "",
    dateTime: getNow(),
    message: ""
  });
  const [documentList, setDocumentList] = useState({
    columns:  [
      {label:'Řádek', field:'rowNr', sort: true, width: 50},
      {label:'Datum a čas', field:'dateTime', sort: false, width: 200},
      {label:'Popisek', field:'description',  sort: false, width: 500}
    ], 
    rows: []
  });

  function realoadNotes()
  {
    fetch(apiBaseUrl + '?action=notes')
    .then((response) => response.json())
    .then((data) => {
        const responseData = JSON.parse(data.responseData);
        setDocumentList({
          columns: documentList.columns,
          rows: responseData.map((note) => ({
            ...note,
            rowNr: note.rowNr * 1,
            dateTime: note.date,
            description: note.header,
            message: note.bodyText
          })),
        })
      }
    );
  }

  function newNote(e)
  {
    if (e) e.preventDefault();
    setFormData({ rowNr: 0, dateTime: getNow(), description: "", message: "" })
    document.querySelector('#Editor .wysiwyg-content').innerHTML = '';
  }

  useEffect(() => {
    if (loading) {
      realoadNotes();
    }
  }, [loading, documentList.columns]);

  useEffect(() => {
    if (documentList.rows.length === 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [documentList.rows]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleEditorChange = (value) => {
    setFormData({ ...formData, message: encodeURIComponent(value) });
  };

  //  --------------------
  const handleSubmit = async (e) => {

    e.preventDefault();
    //  const wysiwyg = document.querySelector('#Editor .wysiwyg-content');
    let response = await processRequest(formData, 'savenote', params.setLoading, params.setMessage, params.setError, params.showAlerMessage);
    if (!response.isError) {
      const responseData = JSON.parse(response.responseData);
      console.log(responseData);
      setDocumentList({
        columns: documentList.columns,
        rows: responseData.map((note) => ({
          ...note,
          rowNr: note.rowNr * 1,
          dateTime: note.date,
          description: note.header,
          message: note.bodyText
        })),
      })
      newNote();
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBDatatable data={documentList} 
          isLoading={loading}
          pagination={false}
          maxHeight='350px' 
          entries={9999}
          noFoundMessage = 'Dokument nenalezen'
          allText='Vše' rowsText='Řádek' ofText='z' 
          hover bordered fixedHeader search striped sm
          onRowClick={(row) => {
            setFormData( { rowNr: row.rowNr, dateTime: row.dateTime, description: row.description, message: row.message } );
            document.querySelector('#Editor .wysiwyg-content').innerHTML = decodeURIComponent(row.message);
          }
        }                
      />
      <MDBRow> <div className="p-3"></div></MDBRow>
      <form onSubmit={handleSubmit}>
        <MDBRow md="6">
          <MDBCol md="4">
            <MDBInput name="date"
                id="date"              
                value={formData.dateTime}
                label="Datum a čas"
                disabled 
                />
          </MDBCol>

          <MDBCol >
            <MDBBtn onClick={newNote}>Nová zpráva</MDBBtn>
          </MDBCol>
        </MDBRow>
        <MDBRow> <div className="p-2"></div></MDBRow>
        <MDBInput name="description"
            id="description"
            onChange={handleChange}
            value={formData.description}
            label="Popisek"
            required
        />
        <MDBRow> <div className="p-2"></div></MDBRow>
        <MDBCol md="4">
          <MDBBtn type="submit" className="btn-block">
            Uložit
          </MDBBtn>
        </MDBCol>
      </form>
      <MDBWysiwyg id="Editor" 
          onChange={handleEditorChange} 
      />
    </MDBContainer>
  );
}
export default Notes;