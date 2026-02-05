// Documents.js
import {useState, useEffect} from 'react';
import { MDBContainer, MDBTable, MDBTableHead, MDBTableBody, MDBBtn, MDBSpinner } from 'mdb-react-ui-kit';
import {formatDate} from '../services/connection.js';

const Documents = ({documentList}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (documentList.length === 0) return;
    setLoading(false);
  }, [documentList]);
      
  return (
    <MDBContainer className="my-5">
      {loading ? (
        <MDBSpinner role="status" className="text-left my-4">
          <span className="visually-hidden">Načítám aktuality...</span>
        </MDBSpinner>
      ) : (
        <MDBTable striped>
          <MDBTableHead>
            <tr>
              <th>Název dokumentu</th>
              <th>Datum vložení</th>
              <th>Popis</th>
              <th>Akce</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {documentList.map((doc, index) => (
              <tr key={index}>
                <td>{doc.docName}</td>
                <td>{formatDate(doc.dateInserted)}</td>
                <td>{doc.description}</td>
                <td>
                  <MDBBtn
                    tag="a"
                    href={'https://drive.google.com/uc?export=download&id='+ doc.fileId}
                    download
                    color="primary"
                  >
                    Stáhnout
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      )}
    </MDBContainer>
  );
};

export default Documents;
