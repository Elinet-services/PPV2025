import { MDBFooter, MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';

const Footer = () => (
  <MDBContainer>
    <MDBFooter className="text-center bg-light text-muted py-2">
      <MDBContainer>
        <div className="footer-credit-bar mt-0" style={{ marginTop: 1.5 }}>
          <div className="text-center py-1">
            <small>
              {"Web realizovala společnost "}
              <a
                href="https://elinet.cz/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {"Elinet services s.r.o."}
              </a>
              {" · "}
              <a href="#/cookies">{"Cookies"}</a>
              {"."}
            </small>
          </div>
        </div>
      </MDBContainer>
    </MDBFooter>
  </MDBContainer>
);

export default Footer;
