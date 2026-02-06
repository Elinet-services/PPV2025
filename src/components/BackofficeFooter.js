import { MDBFooter, MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';

const Footer = () => (
  <MDBContainer>
    <MDBFooter className="text-center bg-light text-muted py-3">
      <MDBContainer>
        <div className="text-center">
          <small>
            {"Web realizovala společnost "}
            <a
              href="https://elinet.cz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {"Elinet services s.r.o."}
            </a>
            {"."}
          </small>
        </div>
      </MDBContainer>
    </MDBFooter>
  </MDBContainer>
);

export default Footer;
