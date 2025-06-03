import { useState, useEffect } from 'react';
import { MDBWysiwyg } from 'mdb-react-wysiwyg';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBInput,
  MDBDatatable,
  MDBCheckbox,
  MDBIcon
} from "mdb-react-ui-kit";
import {processRequest, apiBaseUrl, domainName, getToken} from './connection.js';

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
    published: true,
    message: ""
  });
  const [documentList, setDocumentList] = useState({
    columns:  [
      {label:'Řádek', field:'rowNr', sort: true, width: 50},
      {label:'Publikováno', field:'publishedIcon', sort: false, width: 50},
      {label:'Datum a čas', field:'dateTime', sort: false, width: 200},
      {label:'Popisek', field:'description',  sort: false, width: 500}
    ], 
    rows: []
  });

  function fillDocumentList (responseData)
  {
    setDocumentList({
      columns: documentList.columns,
      rows: responseData.notesArray.map((note) => ({
        ...note,
        rowNr: note.rowNr * 1,
        dateTime: note.date,
        description: note.header,
        published: note.published === "TRUE",
        publishedIcon: note.published === "TRUE" ? <><MDBIcon far icon='check-circle' className='datatable-disable-onclick' /></>: '',
        message: decodeURIComponent(note.bodyText)
      })),
    })
  }

  function realoadNotes()
  {
    fetch(apiBaseUrl, {
      method: "POST",
      body: JSON.stringify({
              source: 'TEST',
              action: 'notelist',
              domain: domainName,
              token: getToken()
      })
    })
    .then((response) => {
        if (response.ok) {
            return response.json()
        } else {            
            return { message: "Požadavek se nepodařilo odeslat", isError: true }
        }
    })
    .then((data) => {
      setLoading(false);
      if (!data.isError)
        fillDocumentList( JSON.parse(data.responseData) );
    })
  }

  function newNote(e)
  {
    if (e) e.preventDefault();
    setFormData({ rowNr: 0, dateTime: getNow(), description: "", published: true, message: "" })
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
  const handleCheckbox = () => {
    setFormData({ ...formData, published: !formData.published });
  };
  const handleEditorChange = (value) => {
    setFormData({ ...formData, message: value });
  };

  function decodeHTML(html) {
    const htmlEntityPattern = /&(?!nbsp;)[a-zA-Z0-9#]+;/;
    // Pokud text obsahuje alespoň jednu HTML entitu, dekódujeme
    if (htmlEntityPattern.test(html)) {
      const parser = new DOMParser();
      return parser.parseFromString(html, "text/html").body.textContent;
    }
    // Jinak vrátíme původní text
    return html;
  }

  //  --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      message: encodeURIComponent( decodeHTML(formData.message) )
    };
    let response = await processRequest(updatedFormData, 'savenote', params.setLoading, params.setMessage, params.setError, params.showAlerMessage);
    if (!response.isError) {
      fillDocumentList( JSON.parse(response.responseData) );
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
            setFormData( { rowNr: row.rowNr, dateTime: row.dateTime, description: row.description, published: row.published, message: row.message } );
            document.querySelector('#Editor .wysiwyg-content').innerHTML = row.message;
          }
        }                
      />
      <MDBRow> <div className="p-3"></div></MDBRow>
      <form onSubmit={handleSubmit}>
        <MDBRow>
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
        <MDBRow>
          <MDBCol md="10">
            <MDBInput name="description"
                id="description"
                onChange={handleChange}
                value={formData.description}
                label="Popisek"
                required
            />
          </MDBCol>
          <MDBCol md="2">
            <MDBCheckbox
              id='published'
              label='Publikovat'
              checked={formData.published}
              onChange={handleCheckbox}
            />
          </MDBCol>
        </MDBRow>
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