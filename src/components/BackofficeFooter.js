import { MDBFooter, MDBContainer } from "mdb-react-ui-kit";

const Footer = () => (
  <MDBContainer>
    <MDBFooter className="text-center bg-light text-muted py-2">
      <MDBContainer>
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