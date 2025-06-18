import { useState, useEffect } from "react";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBRadio, MDBBtn, MDBTypography, MDBSelect } from "mdb-react-ui-kit";
import SHA256 from "crypto-js/sha256";
import {processRequest, domainName, getToken} from '../services/connection.js';


const initialFormState = {
  name: "",
  surname: "",
  email: "",
  phone: "",
  club: "",
  glider: "",
  imatriculation: "",
  startCode: "",
  gliderClass: "club",
  deviceType1: "",
  deviceId1: "",
  deviceType2: "",
  deviceId2: ""
};

const UserRegistration = (params) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isLogged, setLogged] = useState(getToken().length > 0);
  const deviceTypeData = [{text:'', value:''},{ text: 'FLARM', value: 'FLARM'},{ text: 'OGN', value: 'OGN' }, { text: 'ADS-B (ICAO)', value: 'ADS'}]
  let dataLoaded = false;

  //  -------------------------------------------------------------------------------
  //  volani DB pro uvodni nacteni z DB
  useEffect(() => {
    if (isLogged && !dataLoaded) {
      dataLoaded = true;
      loadData();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'deviceId1' || e.target.name === 'deviceId2') {
      e.target.setCustomValidity('');
    }
  };

  const handleRadioChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      gliderClass: e.target.value,
    }));
  };

  const handleSelectChange = (deviceNr, value) => {
    setFormData({ ...formData, [`deviceType${deviceNr}`]: value });
    document.getElementById(`deviceId${deviceNr}`).setCustomValidity('');
  };

  //  -------------------------------------------------------------------------------
  function checkFilledDeviceFields(deviceNr, e)
  {
    const deviceTypeKey = `deviceType${deviceNr}`;
    const deviceIdKey = `deviceId${deviceNr}`;

    const deviceIdInput = document.getElementById(deviceIdKey);
    deviceIdInput.setCustomValidity(''); // Reset custom validity
    // Kontrola: obě pole musí být vyplněná, nebo žádné
    if ((!!formData[deviceTypeKey]) != (!!formData[deviceIdKey])) {
      deviceIdInput.setCustomValidity("Vyplňte buď oba údaje o odpovídači, nebo žádný.");
      if (e) e.target.reportValidity(); // Spustí nativní validaci a zobrazí chybovou hlášku
      return false;
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkFilledDeviceFields(1, e) || !checkFilledDeviceFields(2, e)) return;

    const updatedFormData = {
      ...formData,
      password: SHA256("motorola").toString(),
    };

    let response = await processRequest(updatedFormData, (isLogged ? 'edit' : 'registration'), params.setLoading, params.setMessage, params.setError, params.showAlerMessage);

    if (!response.isError) {
        params.setMessage(isLogged ? "Údaje byly změněny" : "Registrace byla přijata, můžete ji zkontrolovat v seznamu závodníků.");
        if (!isLogged)
          setFormData(initialFormState);
    }
    params.setLoading(false);
  };

  //  -------------------------------------------------------------------------------
  //  prijme data z DB
  async function loadData()
  {
    let response = await processRequest({}, 'getuserdata', params.setLoading, params.setMessage, params.setError, params.showAlerMessage);

    if (!response.isError) {
      const userParams = response.responseData.userParameters[domainName];
      setFormData(
        {
          name: userParams.name,
          surname: userParams.surname,
          email: response.responseData.email,
          phone: userParams.phone,
          club: userParams.club,
          glider: userParams.glider,
          imatriculation: userParams.imatriculation,
          startCode: userParams.startCode,
          gliderClass: userParams.gliderClass,
          deviceType1: userParams.deviceType1,
          deviceId1: userParams.deviceId1,
          deviceType2: userParams.deviceType2,
          deviceId2: userParams.deviceId2
        }
      );
    }
  }

  return (
    <MDBContainer className="my-5">
      <MDBTypography tag="h4" className="mb-4 text-start">
        {isLogged ? 'Změna registrace' : 'Registrační formulář'}
      </MDBTypography>

      <form onSubmit={handleSubmit}>
        <MDBRow>
          <MDBCol md="4">
            <MDBInput label="Jméno" name="name" value={formData.name} onChange={handleChange} autoComplete="given-name" required />
          </MDBCol>
          <MDBCol md="4">
            <MDBInput label="Příjmení" name="surname" value={formData.surname} onChange={handleChange} autoComplete="family-name" required />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="5">
            <MDBInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" required readonly={isLogged} />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label="Telefon" type="tel" name="phone" value={formData.phone} onChange={handleChange} autoComplete="tel" required />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="5">
            <MDBInput label="Aeroklub" name="club" value={formData.club} onChange={handleChange} />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="4">
            <MDBInput label="Typ letadla" name="glider" value={formData.glider} onChange={handleChange} />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label="Imatrikulace" name="imatriculation" value={formData.imatriculation} onChange={handleChange} />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label="Startovní znak" name="startCode" value={formData.startCode} onChange={handleChange} />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="12">
            <label className="form-label">Třída větroně:</label>
            <MDBRadio name="gliderClass" id="gliderClassClub" label="Klubová třída" value="club" checked={formData.gliderClass === "club"} onChange={handleRadioChange} />
            <MDBRadio name="gliderClass" id="gliderClassCombi" label="Kombinovaná třída" value="combi" checked={formData.gliderClass === "combi"} onChange={handleRadioChange} />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="4">
            <MDBSelect label="Typ odpovídače" value={formData.deviceType1} data={deviceTypeData}
              onChange={(e) => {handleSelectChange('1', e.value)}}
            />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label="Číslo odpovídače" id="deviceId1" name="deviceId1" value={formData.deviceId1} onChange={handleChange} />
          </MDBCol>
        </MDBRow>
        <MDBRow className="mt-3">
          <MDBCol md="4">
            <MDBSelect label="Typ odpovídače" value={formData.deviceType2} data={deviceTypeData}
              onChange={(e) => {handleSelectChange('2', e.value)}}
            />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label="Číslo odpovídače" id="deviceId2" name="deviceId2" value={formData.deviceId2} onChange={handleChange} />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-4">
          <MDBCol md="4">
            <MDBBtn type="submit" className="btn-block">
              Odeslat registraci
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </form>
    </MDBContainer>
  );
};

export default UserRegistration;