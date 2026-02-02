import { MDBFooter, MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';

const Footer = () => (
  <MDBContainer>
  <MDBFooter className="text-center text-lg-start bg-light text-muted py-3">
    <MDBContainer>
      <MDBRow className="text-center">
        <MDBCol lg="2" md="6" className="mb-4">
          <h6 className="text-uppercase">Ředitel závodu</h6>
          <ul className="list-unstyled">
            <li><small><b>Jan Koťan</b></small></li>
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
            <li><small><b>Karel Douda</b></small></li>
          </ul>
        </MDBCol>
        <MDBCol lg="2" md="6" className="mb-4">
          <h6 className="text-uppercase">Task setter</h6>
          <ul className="list-unstyled">
            <li><small><b>Jan Kantor / Petr Hofman</b></small></li>
          </ul>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  </MDBFooter>
  </MDBContainer>
);

export default Footer;
