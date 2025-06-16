// Documents.js
import {useState, useEffect} from 'react';
import { MDBContainer, MDBTable, MDBTableHead, MDBTableBody, MDBBtn } from 'mdb-react-ui-kit';

const Documents = () => {
    const [documentList, setDocumentList] = useState([]);

    useEffect(() => {
    fetch("/documents.json")
      .then((res) => res.json())
      .then((data) => {
        setDocumentList(data);
      });
  }, []);

  return (
    <MDBContainer className="my-5">
      <h2>Dokumenty k PPV</h2>
      
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
              <td>{doc.name}</td>
              <td>{doc.date}</td>
              <td>{doc.info}</td>
              <td>
                <MDBBtn
                  tag="a"
                  href={doc.path}
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
    </MDBContainer>
  );
};

export default Documents;