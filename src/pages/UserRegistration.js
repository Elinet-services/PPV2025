import { useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBSelect } from "mdb-react-ui-kit";
import { getCountries } from "react-phone-number-input";
import { isValidPhoneNumber, parsePhoneNumberFromString, getCountryCallingCode } from "libphonenumber-js";
import { sha256 } from "node-forge";
import {processRequest, domainName, getToken, getEmail} from '../services/connection.js';
import { AppContext } from "../App.js";
import ClubTypeahead from "../components/ClubTypeahead.js";
import { AEROKLUBY } from "../constants/aeroclubs.js";


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
  const [phoneCountry, setPhoneCountry] = useState("CZ");
  const [phoneNational, setPhoneNational] = useState("");
  const [raceListData, setRaceListData] = useState([]);

  //  --------------------------
  const setUserData = useCallback((domain, userParams) => {
    if (userParams === undefined) {
      setFormData(initialFormState);
      return;
    }

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
    });
  }, [setFormData]);

  //  -------------------------------------------------------------------------------
  //  prijme data z DB
  const loadData = useCallback(async () => {
    let response = await processRequest({}, 'getuserdata', params.setLoading, params.setMessage, params.setError, params.showAlerMessage);

    if (!response.isError) {
      setUserParameters(response.responseData.userParameters);

      const raceListArray = Object.entries(response.responseData.userParameters).map(([key]) => ({
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
  }, [params.setLoading, params.setMessage, params.setError, params.showAlerMessage, setUserData]);

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
  }, [loadData]);

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
    if (e.target.name === 'deviceId1') {
      const nextValue = e.target.value;
      if (nextValue.length === 0 && formData.deviceId2) {
        setFormData({ ...formData, deviceId1: formData.deviceId2, deviceId2: "" });
      } else {
        setFormData({ ...formData, deviceId1: nextValue });
      }
      return;
    }
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

  const updatePhoneValue = (country, nationalRaw) => {
    const digits = (nationalRaw || "").replace(/[^\d]/g, "");
    if (!digits) {
      setFormData((prev) => ({ ...prev, phone: "" }));
      return;
    }
    const code = getCountryCallingCode(country || "CZ");
    setFormData((prev) => ({ ...prev, phone: `+${code}${digits}` }));
  };

  const handlePhoneNationalChange = (e) => {
    const nextRaw = e.target.value || "";
    setPhoneNational(nextRaw);
    updatePhoneValue(phoneCountry, nextRaw);
  };

  const handlePhoneCountryChange = (country) => {
    const nextCountry = country || "CZ";
    setPhoneCountry(nextCountry);
    updatePhoneValue(nextCountry, phoneNational);
  };

  useEffect(() => {
    if (!formData.phone) {
      if (phoneNational !== "") setPhoneNational("");
      return;
    }
    const parsed = parsePhoneNumberFromString(formData.phone);
    if (!parsed) return;
    const nextCountry = parsed.country || phoneCountry;
    const nextNational = parsed.nationalNumber || "";
    if (nextCountry !== phoneCountry) setPhoneCountry(nextCountry);
    if (nextNational !== phoneNational) setPhoneNational(nextNational);
  }, [formData.phone, phoneCountry, phoneNational]);

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
    const deviceId1Input = document.getElementById("deviceId1");
    const deviceId2Input = document.getElementById("deviceId2");
    if (deviceId1Input) deviceId1Input.setCustomValidity("");
    if (deviceId2Input) deviceId2Input.setCustomValidity("");

    // Pokud je vyplněn záložní logger, musí být vyplněn i hlavní.
    if (deviceNr === 2 && !!formData.deviceId2 && !formData.deviceId1) {
      if (deviceId2Input) {
        deviceId2Input.setCustomValidity("Nejdříve vyplňte hlavní logger, poté záložní.");
        if (e) e.target.reportValidity();
      }
      return false;
    }
    return true
  }

  //  -------------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || !isValidPhoneNumber(formData.phone)) {
      const phoneInput = document.getElementById("phone") || document.getElementById("phone-mobile");
      if (phoneInput) {
        phoneInput.setCustomValidity(formData.phone ? "Zadejte platné telefonní číslo." : "Telefon je povinný.");
        phoneInput.reportValidity();
      }
      return;
    }
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

  return (
    <MDBContainer className="my-5">
      {isLogged ? null : (
        <MDBRow className="mb-3">
          <label className="form-label">
            Pokud jste s námi již létali, <Link to="/login">přihlaste</Link>, budete moci použít údaje z předchozích ročníků.
          </label>
        </MDBRow>
      )}
      <form onSubmit={handleSubmit}>

        {isLogged && !isRegistered ? 
          <MDBRow className="mb-3">
            <MDBCol md="3">
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
          <MDBCol md="3" className="d-none d-md-block">
            <div className="d-flex gap-2 align-items-end">
              <select
                className="form-select phone-country-select phone-country-select--compact"
                value={phoneCountry}
                onChange={(e) => handlePhoneCountryChange(e.target.value)}
              >
                {getCountries().map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <div className="flex-grow-1">
                <MDBInput
                  id="phone"
                  name="phone"
                  label="Telefon"
                  type="tel"
                  value={phoneNational}
                  onChange={handlePhoneNationalChange}
                  autoComplete="tel"
                />
              </div>
            </div>
          </MDBCol>
        </MDBRow>

        {isLogged ? null : (
          <>
            <MDBRow className="mt-3">
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
          </>
        )}

        <MDBRow className="mt-3 d-md-none">
          <MDBCol md="3">
            <div className="d-flex gap-2 align-items-end">
              <select
                className="form-select phone-country-select phone-country-select--compact"
                value={phoneCountry}
                onChange={(e) => handlePhoneCountryChange(e.target.value)}
              >
                {getCountries().map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <div className="flex-grow-1">
                <MDBInput
                  id="phone-mobile"
                  name="phone"
                  label="Telefon"
                  type="tel"
                  value={phoneNational}
                  onChange={handlePhoneNationalChange}
                  autoComplete="tel"
                />
              </div>
            </div>
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="5">
            <ClubTypeahead
              label="Aeroklub"
              value={formData.club}
              clubs={AEROKLUBY}
              onChange={(club) => setFormData({ ...formData, club })}
            />
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
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <label className="form-label mb-0">Třída větroně:</label>
              <div className="btn-group glider-class-group" role="group" aria-label="Třída větroně">
                {(
                  formData.gliderClass === "club"
                    ? [
                        { key: "club", label: "Klubová třída" },
                        { key: "combi", label: "Kombinovaná třída" },
                      ]
                    : [
                        { key: "combi", label: "Kombinovaná třída" },
                        { key: "club", label: "Klubová třída" },
                      ]
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`btn ${formData.gliderClass === item.key ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFormData((prevData) => ({ ...prevData, gliderClass: item.key }))}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </MDBCol>
        </MDBRow>
        <MDBRow className="mt-3">
          <MDBCol md="3">
            <MDBInput label="Hlavní logger" id="deviceId1" name="deviceId1" value={formData.deviceId1} onChange={handleChange} />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput
              label="Záložní logger"
              id="deviceId2"
              name="deviceId2"
              value={formData.deviceId2}
              onChange={handleChange}
              disabled={!formData.deviceId1}
            />
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



























