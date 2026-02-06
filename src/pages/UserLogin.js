import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MDBBtn, MDBCol, MDBContainer, MDBInput, MDBRow, MDBTypography } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";
import { sha256 } from "node-forge";

import { processRequest, resetCookies, setCookies } from "../services/connection";

const initialFormState = {
  email: "",
  password: "",
};

const Login = (params) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialFormState);
  const [action, setAction] = useState("login");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value.length < 8) e.target.setCustomValidity(t("login.passwordMin8Error"));
      else e.target.setCustomValidity("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = formData.email.trim().toLowerCase();
    resetCookies();

    const updatedFormData = {
      ...formData,
      email: normalizedEmail,
      password:
        action === "login"
          ? sha256.create().update(normalizedEmail + formData.password).digest().toHex()
          : "",
    };

    const response = await processRequest(
      updatedFormData,
      action,
      params.setLoading,
      params.setMessage,
      params.setError,
      params.showAlerMessage
    );

    if (!response.isError && action === "login") {
      setCookies(response.responseData);
      setFormData(initialFormState);
      params.setUserRights(response.responseData.rights);
      if (response.responseData.role === "A") navigate("/backoffice");
      else navigate("/");
    }
  };

  return (
    <MDBContainer className="my-5">
      {action === "login" ? (
        <section>
          <form onSubmit={handleSubmit}>
            <MDBRow className="g-3 align-items-end">
              <MDBCol md="4">
                <MDBInput
                  name="email"
                  id="email"
                  onChange={handleChange}
                  value={formData.email}
                  type="email"
                  label={t("login.email")}
                  required
                  autoComplete="email"
                />
              </MDBCol>
              <MDBCol md="4">
                <MDBInput
                  name="password"
                  id="password"
                  onChange={handleChange}
                  value={formData.password}
                  type="password"
                  label={t("login.password")}
                  required
                  autoComplete="current-password"
                />
              </MDBCol>
              <MDBCol md="4">
                <div className="d-flex gap-2">
                  <MDBBtn type="submit" color="primary" className="w-100 px-4 login-btn">
                    {t("login.signIn")}
                  </MDBBtn>
                  <MDBBtn
                    type="button"
                    color="secondary"
                    className="w-100 px-4 login-btn"
                    onClick={() => setAction("forgotpassword")}
                  >
                    {t("login.forgotPassword")}
                  </MDBBtn>
                </div>
              </MDBCol>
            </MDBRow>
          </form>
        </section>
      ) : (
        <section>
          <MDBTypography tag="h4" className="mb-4 text-start">
            {t("login.resetTitle")}
          </MDBTypography>

          <form onSubmit={handleSubmit}>
            <MDBRow className="g-3 align-items-end">
              <MDBCol md="4">
                <MDBInput
                  name="email"
                  id="email"
                  onChange={handleChange}
                  value={formData.email}
                  type="email"
                  label={t("login.email")}
                  required
                  autoComplete="email"
                />
              </MDBCol>
              <MDBCol md="4">
                <div className="d-flex gap-2">
                  <MDBBtn type="submit" color="primary" className="w-100 px-4 login-btn">
                    {t("login.sendLink")}
                  </MDBBtn>
                  <MDBBtn
                    type="button"
                    color="secondary"
                    className="w-100 px-4 login-btn"
                    onClick={() => setAction("login")}
                  >
                    {t("login.backToLogin")}
                  </MDBBtn>
                </div>
              </MDBCol>
            </MDBRow>
          </form>
        </section>
      )}
    </MDBContainer>
  );
};

export default Login;
