import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBTypography } from "mdb-react-ui-kit";
import { sha256 } from "node-forge";
import { processRequest } from "../services/connection.js";

const initialFormState = {
  token: "",
  password: "",
  rePassword: "",
};

const ResetPassword = (params) => {
  const [formData, setFormData] = useState(initialFormState);
  const navigate = useNavigate();

  const resetToken = new URLSearchParams(useLocation().search).get("resetToken");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      if (e.target.value.length === 0) e.target.setCustomValidity("");
      else if (e.target.value.length < 8) e.target.setCustomValidity("Heslo mus\u00ed m\u00edt d\u00e9lku alespo\u0148 8 znak\u016f");
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

    const sha = sha256.create().update(hexDecode(resetToken.substring(resetToken.indexOf("g") + 1)) + formData.password);

    const updatedFormData = {
      ...formData,
      password: sha.digest().toHex(),
      rePassword: "",
      token: resetToken.substring(0, resetToken.indexOf("g")),
    };

    const response = await processRequest(
      updatedFormData,
      "resetpassword",
      params.setLoading,
      params.setMessage,
      params.setError,
      params.showAlerMessage
    );

    if (!response.isError) {
      setFormData(initialFormState);
      document.querySelectorAll("input").forEach((input) => (input.value = ""));
      navigate("/login");
    }
  };

  return (
    <MDBContainer className="my-5">
      <section>
        <MDBTypography tag="h4" className="mb-4 text-start">
          {"Nastaven\u00ed hesla"}
        </MDBTypography>

        <form onSubmit={handleSubmit}>
          <MDBRow className="g-3 align-items-end">
            <MDBCol md="4">
              <MDBInput
                name="password"
                id="password"
                onChange={handleChange}
                value={formData.password}
                type="password"
                label={"Heslo (min 8 znak\u016f)"}
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
                label={"Heslo pro kontrolu"}
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

function hexDecode(aStr) {
  const hex = aStr.toString();
  let result = "";
  for (let i = 0; i < hex.length; i += 2) result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return result;
}

export default ResetPassword;
