import { useState } from "react";
import { MDBBtn, MDBCol, MDBContainer, MDBInput, MDBRow, MDBTypography } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";
import { sha256 } from "node-forge";

import { getEmail, processRequest } from "../services/connection";
import { clearLocalizedValidityOnInput, handleLocalizedValidityOnInvalid } from "../services/formValidation";

const initialFormState = {
  oldPassword: "",
  password: "",
  rePassword: "",
};

const UserChangePassword = (params) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialFormState);
  const handleInvalidCapture = (event) => handleLocalizedValidityOnInvalid(event, t);
  const handleInputCapture = (event) => clearLocalizedValidityOnInput(event);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "oldPassword") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value.length < 8) e.target.setCustomValidity(t("changePassword.passwordMin8Error"));
      else e.target.setCustomValidity("");
    }
    if (e.target.name === "password") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value.length < 8) e.target.setCustomValidity(t("changePassword.passwordMin8Error"));
      else if (e.target.value === formData.oldPassword) e.target.setCustomValidity(t("changePassword.sameAsPreviousError"));
      else e.target.setCustomValidity("");
    }
    if (e.target.name === "rePassword") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value !== formData.password) e.target.setCustomValidity(t("changePassword.passwordsDontMatch"));
      else e.target.setCustomValidity("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      oldPassword: sha256.create().update(getEmail() + formData.oldPassword).digest().toHex(),
      password: sha256.create().update(getEmail() + formData.password).digest().toHex(),
      rePassword: "",
    };

    const response = await processRequest(
      updatedFormData,
      "changepassword",
      params.setLoading,
      params.setMessage,
      params.setError,
      params.showAlerMessage
    );

    if (!response.isError) {
      setFormData(initialFormState);
      document.querySelectorAll("input").forEach((input) => (input.value = ""));
    }
  };

  return (
    <MDBContainer className="my-5">
      <section>
        <MDBTypography tag="h4" className="mb-4 text-start">
          {t("changePassword.title")}
        </MDBTypography>

        <form onSubmit={handleSubmit} onInvalidCapture={handleInvalidCapture} onInputCapture={handleInputCapture}>
          <MDBRow className="g-3 align-items-end">
            <MDBCol md="4">
              <MDBInput
                name="oldPassword"
                id="oldPassword"
                onChange={handleChange}
                value={formData.oldPassword}
                type="password"
                label={t("changePassword.oldPassword")}
                required
                autoComplete="current-password"
              />
            </MDBCol>
            <MDBCol md="4">
              <MDBInput
                name="password"
                id="password"
                onChange={handleChange}
                value={formData.password}
                type="password"
                label={t("changePassword.newPasswordMin8")}
                required
                autoComplete="new-password"
              />
            </MDBCol>
            <MDBCol md="4">
              <MDBInput
                name="rePassword"
                id="rePassword"
                onChange={handleChange}
                value={formData.rePassword}
                type="password"
                label={t("changePassword.newPasswordCheck")}
                required
                autoComplete="new-password"
              />
            </MDBCol>
          </MDBRow>

          <MDBRow className="g-3 mt-1">
            <MDBCol md="4">
              <MDBBtn type="submit" color="primary" className="w-100 px-4 login-btn">
                {t("changePassword.setNewPassword")}
              </MDBBtn>
            </MDBCol>
          </MDBRow>
        </form>
      </section>
    </MDBContainer>
  );
};

export default UserChangePassword;
