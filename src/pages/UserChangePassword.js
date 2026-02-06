import { useState } from "react";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBTypography } from "mdb-react-ui-kit";
import { sha256 } from "node-forge";
import { processRequest, getEmail } from "../services/connection.js";

const initialFormState = {
  oldPassword: "",
  password: "",
  rePassword: "",
};

const UserChangePassword = (params) => {
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "oldPassword") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value.length < 8) e.target.setCustomValidity("Heslo mus\u00ed m\u00edt d\u00e9lku alespo\u0148 8 znak\u016f");
      else e.target.setCustomValidity("");
    }
    if (e.target.name === "password") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value.length < 8) e.target.setCustomValidity("Heslo mus\u00ed m\u00edt d\u00e9lku alespo\u0148 8 znak\u016f");
      else if (e.target.value === formData.oldPassword) e.target.setCustomValidity("Heslo je stejn\u00e9 jako p\u0159edchoz\u00ed");
      else e.target.setCustomValidity("");
    }
    if (e.target.name === "rePassword") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value !== formData.password) e.target.setCustomValidity("Hesla se neshoduj\u00ed");
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
          {"Zm\u011bna hesla"}
        </MDBTypography>

        <form onSubmit={handleSubmit}>
          <MDBRow className="g-3 align-items-end">
            <MDBCol md="4">
              <MDBInput
                name="oldPassword"
                id="oldPassword"
                onChange={handleChange}
                value={formData.oldPassword}
                type="password"
                label={"Star\u00e9 heslo"}
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
                label={"Nov\u00e9 heslo (min 8 znak\u016f)"}
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
                label={"Nov\u00e9 heslo pro kontrolu"}
                required
                autoComplete="new-password"
              />
            </MDBCol>
          </MDBRow>

          <MDBRow className="g-3 mt-1">
            <MDBCol md="4">
              <MDBBtn type="submit" color="primary" className="w-100 px-4 login-btn">
                {"Nastavit nov\u00e9 heslo"}
              </MDBBtn>
            </MDBCol>
          </MDBRow>
        </form>
      </section>
    </MDBContainer>
  );
};

export default UserChangePassword;
