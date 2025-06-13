import { useState, useEffect } from "react";
import { MDBListGroup, MDBListGroupItem, MDBTabs, MDBTabsItem, MDBTabsLink,
  MDBContainer, MDBSpinner  } from "mdb-react-ui-kit";
import {apiBaseUrl} from '../services/connection.js'

const Actualities = () => {
  const [loading, setLoading] = useState(true);
  const [allNoteList, setAllNoteList] = useState(false);
  const [documentList, setDocumentList] = useState([]);

  useEffect(() => {
    //  volani DB pro aktuality
    fetch(apiBaseUrl + '?action=notes&limit=1000')
    .then((response) => {
        if (response.ok) {
            return response.json()
        } else {
            return { message: "Požadavek se nepodařilo odeslat", isError: true }
        }
    })
    .then((data) => {
      setLoading(false);
      if (!data.isError) {
        setDocumentList(JSON.parse(data.responseData).reverse());
      }
    })
  }, []);

  const filteredDocumentList = allNoteList ? documentList: documentList.slice(0, 5);

  return (
    <div id="actualities">
      <MDBTabs>
        <MDBTabsItem>
          <MDBTabsLink onClick={() => setAllNoteList(false)} active={allNoteList === false}>
            Poslední aktuality
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink onClick={() => setAllNoteList(true)} active={allNoteList === true}>
            Všechny aktuality
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>
      {loading ? (
          <MDBSpinner role="status" className="text-left my-4">
            <span className="visually-hidden">Načítám aktuality...</span>
          </MDBSpinner>
      ) : (
        <MDBListGroup>
          {filteredDocumentList.map(({ date, header, bodyText }, index) => (
            <MDBListGroupItem key={index}>
              <h6>{date} - <b> {header}</b></h6>
              <span dangerouslySetInnerHTML={{ __html: decodeURIComponent(bodyText) }} />            
            </MDBListGroupItem>
          ))}
        </MDBListGroup>
      )}
    </div>
  );
};

export default Actualities;