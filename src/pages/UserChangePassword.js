import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBTypography } from "mdb-react-ui-kit";
import { sha256 } from "node-forge";
import {processRequest, getEmail} from '../services/connection.js';

const initialFormState = {
  oldPassword: "",
  password: "",
  rePassword: ""
};

const UserChangePassword = (params) => {
  const [formData, setFormData] = useState(initialFormState);
  const navigate = useNavigate();

  const resetToken = new URLSearchParams(useLocation().search).get('resetToken');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'oldPassword') {
      if (e.target.value.length === 0)
          e.target.setCustomValidity('');
      else if (e.target.value.length < 8)
          e.target.setCustomValidity('Heslo musí mít délku alespoň 8 znaků');
      else
          e.target.setCustomValidity('');
    }
    if (e.target.name === 'password') {
      if (e.target.value.length === 0)
          e.target.setCustomValidity('');
      else if (e.target.value.length < 8)
          e.target.setCustomValidity('Heslo musí mít délku alespoň 8 znaků');
      else if (e.target.value == formData.oldPassword)
          e.target.setCustomValidity('Heslo je stejné jako předchozí');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      oldPassword: sha256.create().update(getEmail + formData.oldPassword).digest().toHex(),
      password: sha256.create().update(getEmail + formData.password).digest().toHex(),
      rePassword: ''
    };
    let response = await processRequest(updatedFormData, "changepassword", params.setLoading, params.setMessage, params.setError, params.showAlerMessage);

    if (!response.isError) {
      setFormData(initialFormState);
      document.querySelectorAll("input").forEach((input) => (input.value = ""));
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBTypography tag="h4" className="mb-4 text-start">
        Změna hesla
      </MDBTypography>

      <form onSubmit={handleSubmit}>
        <MDBCol md="4">
          <MDBRow >
            <MDBInput
                name="oldPassword"
                id="oldPassword"
                onChange={handleChange}
                value={formData.oldPassword}
                type="password"
                wrapperClass="mb-4"
                label="Staré heslo"
                required  // autoComplete="current-password"
            />
          </MDBRow>
          <MDBRow >
            <MDBInput
                name="password"
                id="password"
                onChange={handleChange}
                value={formData.password}
                type="password"
                wrapperClass="mb-4"
                label="Nové heslo (min 8 znaků)"
                required autoComplete="new-password"
            />
          </MDBRow>
          <MDBRow md="4">
            <MDBInput
                name="rePassword"
                id="rePassword"
                onChange={handleChange}
                value={formData.rePassword}
                type="password"
                wrapperClass="mb-4"
                label="Nové heslo pro kontrolu"
                required autoComplete="new-password"
            />
          </MDBRow>
          <MDBRow className="mt-4">
            <MDBBtn type="submit" className="btn-block">
              Nastavit nové heslo
            </MDBBtn>
          </MDBRow>
        </MDBCol>
      </form>
    </MDBContainer>
  );
};

export default UserChangePassword;