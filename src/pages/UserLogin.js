import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
  MDBTypography,
} from "mdb-react-ui-kit";
import { sha256 } from "node-forge";
import { processRequest, setCookies, resetCookies } from "../services/connection.js";

const initialFormState = {
  email: "",
  password: "",
};

const Login = (params) => {
  const [formData, setFormData] = useState(initialFormState);
  const [action, setAction] = useState("login");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value.length < 8) e.target.setCustomValidity("Heslo mus\u00ed m\u00edt d\u00e9lku alespo\u0148 8 znak\u016f");
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
      password: action === "login"
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
                  label="Email"
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
                  label="Heslo"
                  required
                  autoComplete="current-password"
                />
              </MDBCol>
              <MDBCol md="4">
                <div className="d-flex gap-2">
                  <MDBBtn type="submit" color="primary" className="w-100 px-4 login-btn">
                    {"P\u0159ihl\u00e1sit"}
                  </MDBBtn>
                  <MDBBtn
                    type="button"
                    color="secondary"
                    className="w-100 px-4 login-btn"
                    onClick={() => setAction("forgotpassword")}
                  >
                    {"Zapomenut\u00e9 heslo"}
                  </MDBBtn>
                </div>
              </MDBCol>
            </MDBRow>
          </form>
        </section>
      ) : (
        <section>
          <MDBTypography tag="h4" className="mb-4 text-start">
            {"Obnoven\u00ed hesla"}
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
                  label="Email"
                  required
                  autoComplete="email"
                />
              </MDBCol>
              <MDBCol md="4">
                <div className="d-flex gap-2">
                  <MDBBtn type="submit" color="primary" className="w-100 px-4 login-btn">
                    {"Odeslat odkaz"}
                  </MDBBtn>
                  <MDBBtn
                    type="button"
                    color="secondary"
                    className="w-100 px-4 login-btn"
                    onClick={() => setAction("login")}
                  >
                    {"Zp\u011bt na p\u0159ihl\u00e1\u0161en\u00ed"}
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
