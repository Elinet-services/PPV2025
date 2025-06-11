import { MDBContainer, MDBRow, MDBCol} from 'mdb-react-ui-kit';
import Actualities from '../components/Actualities';
import Weather from '../components/Weather';

const organizers = [
  { id: 'aklt', src: "/img/logo-AKLT.gif", alt: "AK Letňany", link: "https://www.akletnany.cz/" },
  { id: 'akhb', src: "/img/logo-AKHB.gif", alt: "AK Havlíčkův Brod", link: "https://aeroklubhb.cz/" },
  { id: 'hb', src: "/img/logo-HB.gif", alt: "Havlíčkův Brod", link: "https://www.muhb.cz/" }
];

const LOGO_WIDTHS = {
  aklt: '50%',
  akhb: '34%',
  hb: '40%',
};

const HomePage = () => {
  return (
    <MDBContainer className="my-4">
      {/* Organizátoři sekce */}
      <MDBRow className="justify-content-center align-items-center">
        {organizers.map(org => (
          <MDBCol key={org.id} size="12" sm="4" className="text-center mb-4">
            <a href={org.link} target="_blank" rel="noopener noreferrer">
              <img
                src={org.src}
                alt={org.alt}
                className="img-fluid"
                style={{ width: LOGO_WIDTHS[org.id] || '100%', height: 'auto' }}
              />
            </a>
          </MDBCol>
        ))}
      </MDBRow>

      <MDBRow>
        <MDBCol md="8">
            <Actualities />
        </MDBCol>
        <MDBCol md="4">
            <Weather />
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default HomePage;