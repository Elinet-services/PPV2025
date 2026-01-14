import { useState, useEffect } from "react";
import { MDBListGroup, MDBListGroupItem, MDBTabs, MDBTabsItem, MDBTabsLink, MDBSpinner  } from "mdb-react-ui-kit";
import {formatDate} from '../services/connection.js';

const Actualities = ({noteList}) => {
  const [loading, setLoading] = useState(true);
  const [allNoteList, setAllNoteList] = useState(false);

  const filteredNoteList = allNoteList ? noteList: noteList.slice(0, 5);

  useEffect(() => {
    if (noteList.length === 0) return;
    setLoading(false);
  }, [noteList]);

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
          {filteredNoteList.map(({ date, header, bodyText }, index) => (
            <MDBListGroupItem key={index}>
              <h6>{formatDate(date)} - <b> {header}</b></h6>
              <span dangerouslySetInnerHTML={{ __html: decodeURIComponent(bodyText) }} />            
            </MDBListGroupItem>
          ))}
        </MDBListGroup>
      )}
    </div>
  );
};

export default Actualities;