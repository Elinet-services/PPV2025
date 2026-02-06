import { MDBFooter, MDBContainer, MDBRow, MDBCol } from "mdb-react-ui-kit";

const Footer = () => (
  <MDBContainer>
    <MDBFooter className="text-center text-lg-start bg-light text-muted py-2">
      <MDBContainer>
        <MDBRow className="text-center">
          <MDBCol lg="2" md="6" className="mb-4">
            <h6 className="text-uppercase">Ředitel závodu</h6>
            <ul className="list-unstyled">
              <li><small><b>Jan (Kotě) Koťan</b></small></li>
              <li><small><a href="mailto:poradatel@ppvcup.cz">poradatel@ppvcup.cz</a></small></li>
            </ul>
          </MDBCol>
          <MDBCol lg="2" md="6" className="mb-4">
            <h6 className="text-uppercase">Meteorolog</h6>
            <ul className="list-unstyled">
              <li><small><b>Petr (Píta) Hoffman</b></small></li>
              <li><small><a href="mailto:meteorolog@ppvcup.cz">meteorolog@ppvcup.cz</a></small></li>
            </ul>
          </MDBCol>
          <MDBCol lg="2" md="6" className="mb-4">
            <h6 className="text-uppercase">Hospodář</h6>
            <ul className="list-unstyled">
              <li><small><b>Martin Holík</b></small></li>
              <li><small><a href="mailto:registrace@ppvcup.cz">registrace@ppvcup.cz</a></small></li>
            </ul>
          </MDBCol>

          <MDBCol lg="2" md="6" className="mb-4">
            <h6 className="text-uppercase">Hlavní rozhodčí</h6>
            <ul className="list-unstyled">
              <li><small><b>Matěj Kábrt</b></small></li>
            </ul>
          </MDBCol>
          <MDBCol lg="2" md="6" className="mb-4">
            <h6 className="text-uppercase">Předseda jury</h6>
            <ul className="list-unstyled">
              <li><small>&nbsp;</small></li>
            </ul>
          </MDBCol>
          <MDBCol lg="2" md="6" className="mb-4">
            <h6 className="text-uppercase">Task setter</h6>
            <ul className="list-unstyled">
              <li><small><b>Jan Kantor / Petr Hofman</b></small></li>
            </ul>
          </MDBCol>
        </MDBRow>

        <div className="footer-credit-bar mt-0" style={{ marginTop: 1.5 }}>
          <div className="text-center py-1">
            <small className="footer-credit-content">
              <span>{"Web realizovala společnost "}</span>
              <a href="https://elinet.cz/" target="_blank" rel="noopener noreferrer">
                {"Elinet services s.r.o."}
              </a>
              <span className="footer-credit-divider" aria-hidden="true" />
              <a className="footer-credit-cookies" href="#/cookies">{"Cookies"}</a>
            </small>
          </div>
        </div>
      </MDBContainer>
    </MDBFooter>
  </MDBContainer>
);

export default Footer;
