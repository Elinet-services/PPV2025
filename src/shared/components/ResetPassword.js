import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
  MDBTypography,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBSpinner,
  MDBModalFooter
} from "mdb-react-ui-kit";
import { sha256 } from "node-forge";
import {apiBaseUrl} from './connection.js';

const initialFormState = {
  action: "resetpassword",
  token: "",
  password: "",
  rePassword: "",
  source: "testResetPasswordForm",
};

const ResetPassword = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetToken = new URLSearchParams(useLocation().search).get('resetToken');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsError(false);
    setLoading(true);
    setModalOpen(true);
    const sha = sha256.create().update(hexDecode(resetToken.substring(resetToken.indexOf('g')+ 1 )) + formData.password);
  
    const updatedFormData = {
      ...formData,
      password: sha.digest().toHex(),
      rePassword: '',
      token: resetToken.substring(0, resetToken.indexOf('g'))
    };

    await fetch(apiBaseUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(updatedFormData),
    })
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        return {isError:true, message: `HTTP chyba: ${response.status}`}
      }
    })
    .then((responseData) => {
      console.log(responseData);
      if (!responseData.isError) {
        setFormData(initialFormState);
        document.querySelectorAll("input").forEach((input) => (input.value = ""));    
      }
      setIsError(responseData.isError);
      setMessage(responseData.message);
    })
    .catch((e) => {
      console.log(e.message)
      setIsError(true);
      setMessage("Kritická chyba: "+ e.message);    
    })
    
    setLoading(false);    
  };

  return (
    <MDBContainer className="my-5">
      <MDBTypography tag="h4" className="mb-4 text-start">
        Nastavení hesla
      </MDBTypography>

      <form onSubmit={handleSubmit}>
        <MDBCol md="4">
          <MDBRow >
            <MDBInput
                name="password"
                id="password"
                onChange={handleChange}
                value={formData.password}
                type="password"
                wrapperClass="mb-4"
                label="Heslo (min 8 znaků)"
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
                label="Heslo pro kontrolu"
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

      <MDBModal open={modalOpen} tabIndex="-1">
        <MDBModalDialog centered>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{loading ? "Měním Vaše heslo..." : isError ? "Chyba" : "Úspěch"}</MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody className="text-center">
              {loading ? <MDBSpinner role="status" /> : <p>{message}</p>}
            </MDBModalBody>
            {!loading && (
              <MDBModalFooter>
                <MDBBtn color="secondary" onClick={() => setModalOpen(false)}>
                  Zavřít
                </MDBBtn>
                {!isError ?
                  <MDBBtn color="primary" onClick={() => navigate("/login")}>
                    přihlásit se
                  </MDBBtn> : ''
                }
              </MDBModalFooter>
            )}
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>
  );
};

function hexDecode(aStr)
{
  const hex = aStr.toString();
  let result = '';
  for (let i = 0; i < hex.length; i += 2)
    result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return result;
}

export default ResetPassword;