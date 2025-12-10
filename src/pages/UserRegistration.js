import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBRadio, MDBBtn, MDBTypography, MDBSelect } from "mdb-react-ui-kit";
import { sha256 } from "node-forge";
import {processRequest, domainName, getToken, getEmail} from '../services/connection.js';
import { AppContext } from "../App.js";


const initialFormState = {
  domain: domainName,
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
  deviceId2: "",
  password: "",
  rePassword: ""
};

const UserRegistration = (params) => {
  const app = useContext(AppContext);
  const [formData, setFormData] = useState(initialFormState);
  const [isLogged, setLogged] = useState(getToken().length > 0);
  const [isRegistered, setRegistered] = useState(false);
  const [userParameters, setUserParameters] = useState({});
  const deviceTypeData = [{text:'', value:''},{ text: 'FLARM', value: 'FLARM'},{ text: 'OGN', value: 'OGN' }, { text: 'ADS-B (ICAO)', value: 'ADS'}]
  const [raceListData, setRaceListData] = useState([]);

  //  -------------------------------------------------------------------------------
  //  volani DB pro uvodni nacteni z DB + kontrola odhlášení
  useEffect(() => {
    const logged = getToken().length > 0;
    setLogged(logged);

    if (logged) {
      loadData();
    } else {
      setRegistered(false);
      setFormData(initialFormState);
      setUserParameters({});
      setRaceListData([]);
    }
  }, []);

  //  odhlaseni
  useEffect(() => {
    // když se změní app.userRights (někdy vyprázdní po logout), resetuj formulář
    if (app.userRights.length === 0 || app.userRights[0] === '') {
      setLogged(false);
      setRegistered(false);
      setFormData(initialFormState);
    }
  }, [app.userRights]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'deviceId1' || e.target.name === 'deviceId2') {
      e.target.setCustomValidity('');
    }
    if (e.target.name === 'password') {
      if (e.target.value.length === 0)
          e.target.setCustomValidity('');
      else if (e.target.value.length < 8)
          e.target.setCustomValidity('Heslo musí mít délku alespoň 8 znaků');
      else
          e.target.setCustomValidity('');
    }
    if (e.target.name === 'rePassword') {
        if (e.target.value.length === 0)
            e.target.setCustomValidity('');
        else if (e.target.value !== formData.password)
            e.target.setCustomValidity('Hesla se neshodují');
        else
            e.target.setCustomValidity('');
    }
  };

  const handleRadioChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      gliderClass: e.target.value,
    }));
  };

  const handleSelectChange = (name, value) => {
    if (name === 'domain') {
      setUserData(value, userParameters[value]);
      return;
    }
    setFormData({ ...formData, [`deviceType${name}`]: value });
    document.getElementById(`deviceId${name}`).setCustomValidity('');
  };

  //  -------------------------------------------------------------------------------
  function checkFilledDeviceFields(deviceNr, e)
  {
    const deviceTypeKey = `deviceType${deviceNr}`;
    const deviceIdKey = `deviceId${deviceNr}`;

    const deviceIdInput = document.getElementById(deviceIdKey);
    deviceIdInput.setCustomValidity(''); // Reset custom validity
    // Kontrola: obě pole musí být vyplněná, nebo žádné
    if ((!!formData[deviceTypeKey]) !== (!!formData[deviceIdKey])) {
      deviceIdInput.setCustomValidity("Vyplňte buď oba údaje o odpovídači, nebo žádný.");
      if (e) e.target.reportValidity(); // Spustí nativní validaci a zobrazí chybovou hlášku
      return false;
    }
    return true
  }

  //  -------------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkFilledDeviceFields(1, e) || !checkFilledDeviceFields(2, e)) return;

    const updatedFormData = {
      ...formData,
      password: (isLogged ? 'xx' : sha256.create().update(formData.email.toLowerCase() + formData.password).digest().toHex()),
      rePassword: ''
    };

    let response = await processRequest(updatedFormData, (isLogged && isRegistered ? 'edit' : 'registration'), params.setLoading, params.setMessage, params.setError, params.showAlerMessage);

    if (!response.isError) {
        if (!isLogged)
          setFormData(initialFormState);
    }
    params.setLoading(false);
  };

  //  --------------------------
  function setUserData(domain, userParams)
  {
    if (userParams === undefined)
      setFormData(initialFormState);
    else
      setFormData({
        domain: domain,
        name: userParams.name || '',
        surname: userParams.surname || '',
        email: getEmail(),
        phone: userParams.phone || '',
        club: userParams.club || '',
        glider: userParams.glider || '',
        imatriculation: userParams.imatriculation || '',
        startCode: userParams.startCode || '',
        gliderClass: userParams.gliderClass || 'club',
        deviceType1: userParams.deviceType1 || '',
        deviceId1: userParams.deviceId1 || '',
        deviceType2: userParams.deviceType2 || '',
        deviceId2: userParams.deviceId2 || '',
        password: '',
        rePassword: ''
      }
    );
  }

  //  -------------------------------------------------------------------------------
  //  prijme data z DB
  async function loadData()
  {
    let response = await processRequest({}, 'getuserdata', params.setLoading, params.setMessage, params.setError, params.showAlerMessage);

    if (!response.isError) {
      setUserParameters(response.responseData.userParameters);

      const raceListArray = Object.entries(response.responseData.userParameters).map(([key, value]) => ({
          text: response.responseData.raceList[key].raceName,
          value: key
      }));
      
      if (response.responseData.userParameters[domainName] === undefined) {
        //  neregistrovan v zavode
        setRegistered(false);
        raceListArray.push({text: response.responseData.raceList[domainName].raceName, value:domainName})
      } else {
        //  registrovan v zavode
        setRegistered(true);
        setUserData(domainName, response.responseData.userParameters[domainName]);
      }
      setRaceListData(raceListArray);
    }
  }

  return (
    <MDBContainer className="my-5">
      <MDBTypography tag="h4" className="mb-4 text-start">
        {isLogged ? (isRegistered ? 'Změna registrace' : 'Registrace z předchozích ročníků') : 'Registrační formulář'}
      </MDBTypography>

      {isLogged ? null : (
        <MDBRow>
          <label className="form-label">
            Pokud jste s námi již létali, <Link to="/login">přihlaste</Link>, budete moci použít údaje z předchozích ročníků.
          </label>
        </MDBRow>
      )}

      <form onSubmit={handleSubmit}>

        {isLogged && !isRegistered ? 
          <MDBRow className="mb-3">
            <MDBCol md="4">
              <MDBSelect label="Předchozí ročníky" value={formData.domain} data={raceListData}
                onChange={(e) => {handleSelectChange('domain', e.value)}}
              />
            </MDBCol>
          </MDBRow>
        : null}

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
            <MDBSelect
              key={`deviceType1-${formData.deviceType1}`}            // vynutí remount při změně hodnoty (včetně prázdné)
              label="Typ odpovídače"
              value={formData.deviceType1}
              data={deviceTypeData}
              onChange={(e) => { handleSelectChange('1', e.value); }}
            />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label="Číslo odpovídače" id="deviceId1" name="deviceId1" value={formData.deviceId1} onChange={handleChange} />
          </MDBCol>
        </MDBRow>
        <MDBRow className="mt-3">
          <MDBCol md="4">
            <MDBSelect
              key={`deviceType2-${formData.deviceType2}`}            // vynutí remount při změně hodnoty (včetně prázdné)
              label="Typ odpovídače"
              value={formData.deviceType2}
              data={deviceTypeData}
              onChange={(e) => { handleSelectChange('2', e.value); }}
            />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label="Číslo odpovídače" id="deviceId2" name="deviceId2" value={formData.deviceId2} onChange={handleChange} />
          </MDBCol>
        </MDBRow>

        {isLogged ? null :
          <div>
            <MDBRow className="mt-4">
              <MDBCol md="4">
                <MDBInput
                  name="password" id="password"
                  onChange={handleChange}
                  value={formData.password}
                  type="password"
                  label="Heslo (min 8 znaků)"
                  required autoComplete="new-password"
                />
              </MDBCol>
            </MDBRow>
            <MDBRow className="mt-3">
              <MDBCol md="4">
                <MDBInput
                  name="rePassword" id="rePassword"
                  onChange={handleChange}
                  value={formData.rePassword}
                  type="password"
                  wrapperClass="mb-4"
                  label="Heslo pro kontrolu"
                  required autoComplete="new-password"
                />
              </MDBCol>
            </MDBRow>
          </div>
        } 

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