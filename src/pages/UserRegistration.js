import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MDBBtn, MDBCol, MDBContainer, MDBInput, MDBRow, MDBSelect, MDBSwitch } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-number-input";
import { sha256 } from "node-forge";

import { AppContext } from "../App";
import ClubTypeahead from "../components/ClubTypeahead";
import { AEROKLUBY } from "../constants/aeroclubs";
import { domainName, getEmail, getToken, processRequest } from "../services/connection";
import { clearLocalizedValidityOnInput, handleLocalizedValidityOnInvalid } from "../services/formValidation";
import {
  DEFAULT_PHONE_COUNTRY,
  detectPhoneCountry,
  normalizePhoneCountryPrefix,
  replacePhoneCountryCode,
  validateRegistrationPhone,
} from "../services/registrationPhone";

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
  rePassword: "",
};

const UserRegistration = (params) => {
  const app = useContext(AppContext);
  const { t } = useTranslation();

  const [formData, setFormData] = useState(initialFormState);
  const [isLogged, setLogged] = useState(getToken().length > 0);
  const [isRegistered, setRegistered] = useState(false);
  const [userParameters, setUserParameters] = useState({});
  const [phoneError, setPhoneError] = useState("");
  const [isPhoneFocused, setPhoneFocused] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_PHONE_COUNTRY);
  const [raceListData, setRaceListData] = useState([]);
  const isPhoneActive = isPhoneFocused || Boolean(formData.phone);
  const handleInvalidCapture = (event) => handleLocalizedValidityOnInvalid(event, t);
  const handleInputCapture = (event) => clearLocalizedValidityOnInput(event);

  const setUserData = useCallback((domain, userParams) => {
    if (userParams === undefined) {
      setFormData(initialFormState);
      setPhoneError("");
      setPhoneFocused(false);
      setPhoneCountry(DEFAULT_PHONE_COUNTRY);
      return;
    }

    const nextPhoneValue = normalizePhoneCountryPrefix(userParams.phone || "");
    const nextPhoneCountry = detectPhoneCountry(nextPhoneValue, DEFAULT_PHONE_COUNTRY);

    setFormData({
      domain,
      name: userParams.name || "",
      surname: userParams.surname || "",
      email: getEmail(),
      phone: nextPhoneValue,
      club: userParams.club || "",
      glider: userParams.glider || "",
      imatriculation: userParams.imatriculation || "",
      startCode: userParams.startCode || "",
      gliderClass: userParams.gliderClass || "club",
      deviceType1: userParams.deviceType1 || "",
      deviceId1: userParams.deviceId1 || "",
      deviceType2: userParams.deviceType2 || "",
      deviceId2: userParams.deviceId2 || "",
      password: "",
      rePassword: "",
    });
    setPhoneError("");
    setPhoneFocused(false);
    setPhoneCountry(nextPhoneCountry);
  }, []);

  const loadData = useCallback(async () => {
    const response = await processRequest(
      {},
      "getuserdata",
      params.setLoading,
      params.setMessage,
      params.setError,
      params.showAlerMessage
    );

    if (!response.isError) {
      setUserParameters(response.responseData.userParameters);

      const raceListArray = Object.entries(response.responseData.userParameters).map(([key]) => ({
        text: response.responseData.raceList[key].raceName,
        value: key,
      }));

      if (response.responseData.userParameters[domainName] === undefined) {
        setRegistered(false);
        raceListArray.push({ text: response.responseData.raceList[domainName].raceName, value: domainName });
      } else {
        setRegistered(true);
        setUserData(domainName, response.responseData.userParameters[domainName]);
      }
      setRaceListData(raceListArray);
    }
  }, [params.setError, params.setLoading, params.setMessage, params.showAlerMessage, setUserData]);

  useEffect(() => {
    const logged = getToken().length > 0;
    setLogged(logged);

    if (logged) {
      loadData();
    } else {
      setRegistered(false);
      setFormData(initialFormState);
      setPhoneError("");
      setPhoneFocused(false);
      setPhoneCountry(DEFAULT_PHONE_COUNTRY);
      setUserParameters({});
      setRaceListData([]);
    }
  }, [loadData]);

  useEffect(() => {
    if (app.userRights.length === 0 || app.userRights[0] === "") {
      setLogged(false);
      setRegistered(false);
      setFormData(initialFormState);
      setPhoneError("");
      setPhoneFocused(false);
      setPhoneCountry(DEFAULT_PHONE_COUNTRY);
    }
  }, [app.userRights]);

  const handleChange = (e) => {
    if (e.target.name === "deviceId1") {
      const nextValue = e.target.value;
      if (nextValue.length === 0 && formData.deviceId2) {
        setFormData({ ...formData, deviceId1: formData.deviceId2, deviceId2: "" });
      } else {
        setFormData({ ...formData, deviceId1: nextValue });
      }
      return;
    }

    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "deviceId1" || e.target.name === "deviceId2") {
      e.target.setCustomValidity("");
    }
    if (e.target.name === "password") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value.length < 8) e.target.setCustomValidity(t("registration.passwordMin8Error"));
      else e.target.setCustomValidity("");
    }
    if (e.target.name === "rePassword") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value !== formData.password) e.target.setCustomValidity(t("registration.passwordsDontMatch"));
      else e.target.setCustomValidity("");
    }
  };

  const handlePhoneChange = (value) => {
    const normalizedPhone = normalizePhoneCountryPrefix(value || "");
    setFormData((prevData) => ({ ...prevData, phone: normalizedPhone }));
    setPhoneCountry(detectPhoneCountry(normalizedPhone, phoneCountry));
    if (phoneError) setPhoneError("");
  };

  const handlePhoneCountryChange = (nextCountry) => {
    if (!nextCountry) return;
    setFormData((prevData) => ({
      ...prevData,
      phone: replacePhoneCountryCode(prevData.phone, phoneCountry, nextCountry),
    }));
    setPhoneCountry(nextCountry);
    if (phoneError) setPhoneError("");
  };

  const handlePhoneFieldFocus = () => setPhoneFocused(true);

  const handlePhoneFieldBlur = (e) => {
    const fieldWrapper = e.currentTarget;
    window.requestAnimationFrame(() => {
      if (!fieldWrapper.contains(document.activeElement)) {
        setPhoneFocused(false);
      }
    });
  };

  const handleSelectChange = (name, value) => {
    if (name === "domain") {
      setUserData(value, userParameters[value]);
      return;
    }
    setFormData({ ...formData, [`deviceType${name}`]: value });
    document.getElementById(`deviceId${name}`).setCustomValidity("");
  };

  function checkFilledDeviceFields(deviceNr, e) {
    const deviceId1Input = document.getElementById("deviceId1");
    const deviceId2Input = document.getElementById("deviceId2");
    if (deviceId1Input) deviceId1Input.setCustomValidity("");
    if (deviceId2Input) deviceId2Input.setCustomValidity("");

    if (deviceNr === 2 && !!formData.deviceId2 && !formData.deviceId1) {
      if (deviceId2Input) {
        deviceId2Input.setCustomValidity(t("registration.fillMainLoggerFirst"));
        if (e) e.target.reportValidity();
      }
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneValidation = validateRegistrationPhone(formData.phone, phoneCountry);
    if (!phoneValidation.isValid) {
      setPhoneError(t(phoneValidation.errorKey));
      return;
    }
    setPhoneError("");
    if (!checkFilledDeviceFields(1, e) || !checkFilledDeviceFields(2, e)) return;

    const updatedFormData = {
      ...formData,
      phone: phoneValidation.normalizedPhone,
      password: isLogged ? "xx" : sha256.create().update(formData.email.toLowerCase() + formData.password).digest().toHex(),
      rePassword: "",
    };

    const response = await processRequest(
      updatedFormData,
      isLogged && isRegistered ? "edit" : "registration",
      params.setLoading,
      params.setMessage,
      params.setError,
      params.showAlerMessage
    );

    if (!response.isError) {
      if (!isLogged) {
        setFormData(initialFormState);
        setPhoneCountry(DEFAULT_PHONE_COUNTRY);
      }
      setPhoneError("");
    }
    params.setLoading(false);
  };

  return (
    <MDBContainer className="my-5">
      {isLogged ? null : (
        <MDBRow className="mb-3">
          <label className="form-label">
            {`${t("registration.signInHintPrefix")} `}
            <Link to="/login">{t("registration.signInHintLink")}</Link>
            {t("registration.signInHintSuffix")}
          </label>
        </MDBRow>
      )}

      <form onSubmit={handleSubmit} onInvalidCapture={handleInvalidCapture} onInputCapture={handleInputCapture}>
        {isLogged && !isRegistered ? (
          <MDBRow className="mb-3">
            <MDBCol md="3">
              <MDBSelect
                label={t("registration.previousYears")}
                value={formData.domain}
                data={raceListData}
                onChange={(e) => {
                  handleSelectChange("domain", e.value);
                }}
              />
            </MDBCol>
          </MDBRow>
        ) : null}

        <MDBRow>
          <MDBCol md="4">
            <MDBInput
              label={t("registration.firstName")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="given-name"
              required
            />
          </MDBCol>
          <MDBCol md="4">
            <MDBInput
              label={t("registration.lastName")}
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              autoComplete="family-name"
              required
            />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="5">
            <MDBInput
              label={t("login.email")}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              readOnly={isLogged}
            />
          </MDBCol>
          <MDBCol md="3">
            <div
              className={`registration-phone-field${isPhoneActive ? " is-active" : ""}${isPhoneFocused ? " is-focused" : ""}${phoneError ? " is-invalid" : ""}`}
              onFocusCapture={handlePhoneFieldFocus}
              onBlurCapture={handlePhoneFieldBlur}
            >
              <label className="registration-phone-label" htmlFor="phone">
                {t("registration.phone")}
              </label>
              <PhoneInput
                id="phone"
                className="registration-phone-input"
                defaultCountry={DEFAULT_PHONE_COUNTRY}
                countryCallingCodeEditable={isPhoneFocused}
                international={isPhoneActive}
                value={formData.phone || undefined}
                onChange={handlePhoneChange}
                onCountryChange={handlePhoneCountryChange}
              />
            </div>
            {phoneError ? <div className="invalid-feedback d-block">{phoneError}</div> : null}
          </MDBCol>
        </MDBRow>

        {isLogged ? null : (
          <>
            <MDBRow className="mt-3">
              <MDBCol md="4">
                <MDBInput
                  name="password"
                  id="password"
                  onChange={handleChange}
                  value={formData.password}
                  type="password"
                  label={t("registration.passwordMin8")}
                  required
                  autoComplete="new-password"
                />
              </MDBCol>
            </MDBRow>
            <MDBRow className="mt-3">
              <MDBCol md="4">
                <MDBInput
                  name="rePassword"
                  id="rePassword"
                  onChange={handleChange}
                  value={formData.rePassword}
                  type="password"
                  wrapperClass="mb-4"
                  label={t("registration.passwordCheck")}
                  required
                  autoComplete="new-password"
                />
              </MDBCol>
            </MDBRow>
          </>
        )}

        <MDBRow className="mt-3">
          <MDBCol md="5">
            <ClubTypeahead
              label={t("registration.aeroclub")}
              value={formData.club}
              clubs={AEROKLUBY}
              onChange={(club) => setFormData({ ...formData, club })}
            />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="4">
            <MDBInput label={t("registration.gliderType")} name="glider" value={formData.glider} onChange={handleChange} />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput
              label={t("registration.imatriculation")}
              name="imatriculation"
              value={formData.imatriculation}
              onChange={handleChange}
            />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label={t("registration.startCode")} name="startCode" value={formData.startCode} onChange={handleChange} />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="12">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <label className="form-label mb-0">{t("registration.gliderClassLabel")}</label>
              <div className="d-flex align-items-center gap-2 glider-class-switch-wrap">
                <span className={`glider-class-switch-label ${formData.gliderClass === "club" ? "active" : ""}`}>
                  {t("registration.gliderClassClub")}
                </span>
                <MDBSwitch
                  id="gliderClassSwitch"
                  className="mb-0 glider-class-switch"
                  aria-label={t("registration.toggleGliderClass")}
                  checked={formData.gliderClass === "combi"}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      gliderClass: e.target.checked ? "combi" : "club",
                    }))
                  }
                />
                <span className={`glider-class-switch-label ${formData.gliderClass === "combi" ? "active" : ""}`}>
                  {t("registration.gliderClassCombi")}
                </span>
              </div>
            </div>
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="3">
            <MDBInput label={t("registration.mainLogger")} id="deviceId1" name="deviceId1" value={formData.deviceId1} onChange={handleChange} />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput
              label={t("registration.backupLogger")}
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
              {t("registration.submitRegistration")}
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </form>
    </MDBContainer>
  );
};

export default UserRegistration;
