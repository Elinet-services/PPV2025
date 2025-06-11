import { useState, useEffect } from "react";
import { MDBListGroup, MDBListGroupItem, MDBTabs, MDBTabsItem, MDBTabsLink  } from "mdb-react-ui-kit";
import {apiBaseUrl} from '../services/connection.js'

const Actualities = () => {
  const [loading, setLoading] = useState(true);  //  volani do DB
  const [allNoteList, setAllNoteList] = useState(false);
  const [documentList, setDocumentList] = useState([]);

  function fillDocumentList (responseData)
  {
    setDocumentList(responseData.reverse());
  }

  function realoadNotes(allNotes)
  {
    setLoading(false);
    setAllNoteList(allNotes);
    setDocumentList([]);
    //  volani DB pro aktuality
    //  pokud je allNotes true, tak se nactou vsechny aktuality, jinak jen 5 poslednich
    fetch(apiBaseUrl + '?action=notes&limit='+ ( allNotes ? 1000 : 5 ))
    .then((response) => {
        if (response.ok) {
            return response.json()
        } else {
            return { message: "Požadavek se nepodařilo odeslat", isError: true }
        }
    })
    .then((data) => {
      if (!data.isError) {
        setLoading(false);
        fillDocumentList( JSON.parse(data.responseData) );
      }
    })
  }
  
  useEffect(() => {
    if (loading) {
      realoadNotes(false);
    }
  }, [loading, documentList]);

  return (
    <div id="actualities">
      <MDBTabs>
        <MDBTabsItem>
          <MDBTabsLink onClick={() => realoadNotes(false)} active={allNoteList === false}>
            Poslední aktuality
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink onClick={() => realoadNotes(true)} active={allNoteList === true}>
            Všechny aktuality
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>
      
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