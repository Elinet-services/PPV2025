import React, { useState, useEffect } from "react";
import { MDBListGroup, MDBListGroupItem, MDBTypography } from "mdb-react-ui-kit";
import {apiBaseUrl} from '../shared/components/connection.js'

const Actualities = () => {
  const [loading, setLoading] = useState(true);  //  volani do DB
  const [documentList, setDocumentList] = useState([]);

  function fillDocumentList (responseData)
  {
    setDocumentList(responseData.reverse());
  }

  function realoadNotes()
  {
    fetch(apiBaseUrl + '?action=notes&limit=5')
    .then((response) => {
        if (response.ok) {
            return response.json()
        } else {
            return { message: "Požadavek se nepodařilo odeslat", isError: true }
        }
    })
    .then((data) => {
      if (!data.isError)
        fillDocumentList( JSON.parse(data.responseData) );
    })
  }
  
  useEffect(() => {
    if (loading) {
      realoadNotes();
    }
  }, [loading, documentList]);

  return (
    <div id="actualities">
      <MDBTypography tag="h4">Aktuality</MDBTypography>
      <MDBListGroup>
        {documentList.map(({ date, header, bodyText }, index) => (
          <MDBListGroupItem key={index}>
            <h6>{date} - <b> {header}</b></h6>
            <span dangerouslySetInnerHTML={{ __html: decodeURIComponent(bodyText) }} />            
          </MDBListGroupItem>
        ))}
      </MDBListGroup>
    </div>
  );
};

export default Actualities;