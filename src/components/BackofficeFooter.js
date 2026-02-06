import { MDBContainer, MDBFooter } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

const BackofficeFooter = () => {
  const { t } = useTranslation();

  return (
    <MDBContainer>
      <MDBFooter className="text-center bg-light text-muted py-2">
        <MDBContainer>
          <div className="footer-credit-bar mt-0" style={{ marginTop: 1.5 }}>
            <div className="text-center py-1">
              <small className="footer-credit-content">
                <span>{`${t("footer.websiteByPrefix")} `}</span>
                <a href="https://elinet.cz/" target="_blank" rel="noopener noreferrer">
                  {"Elinet services s.r.o."}
                </a>
                <span className="footer-credit-divider" aria-hidden="true" />
                <a className="footer-credit-cookies" href="#/cookies">
                  {t("footer.cookies")}
                </a>
              </small>
            </div>
          </div>
        </MDBContainer>
      </MDBFooter>
    </MDBContainer>
  );
};

export default BackofficeFooter;
