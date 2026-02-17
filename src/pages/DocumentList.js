import { useEffect, useState } from "react";
import { MDBBtn, MDBContainer, MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../services/connection";

const Documents = ({ documentList }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (documentList.length === 0) return;
    setLoading(false);
  }, [documentList]);

  return (
    <MDBContainer className="my-5">
      {loading ? (
        <LoadingSpinner className="my-4" height="100px" label={t("documents.loading")} />
      ) : (
        <MDBTable striped>
          <MDBTableHead>
            <tr>
              <th>{t("documents.name")}</th>
              <th>{t("documents.inserted")}</th>
              <th>{t("documents.description")}</th>
              <th>{t("documents.action")}</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {documentList.map((doc, index) => (
              <tr key={index}>
                <td>{doc.docName}</td>
                <td>{formatDate(doc.dateInserted)}</td>
                <td>{doc.description}</td>
                <td>
                  <MDBBtn tag="a" href={`https://drive.google.com/uc?export=download&id=${doc.fileId}`} download color="primary">
                    {t("documents.download")}
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
