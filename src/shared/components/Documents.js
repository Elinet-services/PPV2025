// Documents.js
import React from 'react';
import { MDBContainer, MDBTable, MDBTableHead, MDBTableBody, MDBBtn } from 'mdb-react-ui-kit';

const Documents = () => {
  const documents = [
    {
      name: 'Propozice Plachtařský Pohár Vysočiny 2025 V1.0',
      path: '/docs/Propozice Plachtařský Pohár Vysočiny 2025 V1.0.docx',
      date: '2025-02-06',
      info: 'Oficiální propozice závodu PPV 2025.'
    }
  ];

  return (
    <MDBContainer className="my-4">
      <h2>Dokumentace k PPV</h2>
      
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
          {documents.map((doc, index) => (
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
