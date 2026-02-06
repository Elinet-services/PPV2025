import { MDBCol, MDBContainer, MDBFooter, MDBRow } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <MDBContainer>
      <MDBFooter className="text-center text-lg-start bg-light text-muted py-2">
        <MDBContainer>
          <MDBRow className="text-center">
            <MDBCol lg="2" md="6" className="mb-4">
              <h6 className="text-uppercase">{t("footer.raceDirector")}</h6>
              <ul className="list-unstyled">
                <li>
                  <small>
                    <b>{"Jan (Kot\u011b) Ko\u0165an"}</b>
                  </small>
                </li>
                <li>
                  <small>
                    <a href="mailto:poradatel@ppvcup.cz">poradatel@ppvcup.cz</a>
                  </small>
                </li>
              </ul>
            </MDBCol>
            <MDBCol lg="2" md="6" className="mb-4">
              <h6 className="text-uppercase">{t("footer.meteorologist")}</h6>
              <ul className="list-unstyled">
                <li>
                  <small>
                    <b>{"Petr (P\u00edta) Hoffman"}</b>
                  </small>
                </li>
                <li>
                  <small>
                    <a href="mailto:meteorolog@ppvcup.cz">meteorolog@ppvcup.cz</a>
                  </small>
                </li>
              </ul>
            </MDBCol>
            <MDBCol lg="2" md="6" className="mb-4">
              <h6 className="text-uppercase">{t("footer.treasurer")}</h6>
              <ul className="list-unstyled">
                <li>
                  <small>
                    <b>{"Martin Hol\u00edk"}</b>
                  </small>
                </li>
                <li>
                  <small>
                    <a href="mailto:registrace@ppvcup.cz">registrace@ppvcup.cz</a>
                  </small>
                </li>
              </ul>
            </MDBCol>

            <MDBCol lg="2" md="6" className="mb-4">
              <h6 className="text-uppercase">{t("footer.chiefJudge")}</h6>
              <ul className="list-unstyled">
                <li>
                  <small>
                    <b>{"Mat\u011bj K\u00e1brt"}</b>
                  </small>
                </li>
              </ul>
            </MDBCol>
            <MDBCol lg="2" md="6" className="mb-4">
              <h6 className="text-uppercase">{t("footer.juryChair")}</h6>
              <ul className="list-unstyled">
                <li>
                  <small>&nbsp;</small>
                </li>
              </ul>
            </MDBCol>
            <MDBCol lg="2" md="6" className="mb-4">
              <h6 className="text-uppercase">{t("footer.taskSetter")}</h6>
              <ul className="list-unstyled">
                <li>
                  <small>
                    <b>Jan Kantor / Petr Hofman</b>
                  </small>
                </li>
              </ul>
            </MDBCol>
          </MDBRow>

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

export default Footer;
