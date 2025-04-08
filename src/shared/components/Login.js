import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {apiBaseUrl, domainName, setCookies, resetCookies} from './connection.js';

const initialFormState = {
  action: "login",
  email: "",
  password: "",
  action: "login",
  domain: domainName,
  source: "testLoginForm",
};

const Login = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('login');
  const navigate = useNavigate();

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetCookies();
    setIsError(false);
    setLoading(true);
    setModalOpen(true);

    const sha = sha256.create().update(formData.email + formData.password);
  
    const updatedFormData = {
      ...formData,
      password: (action === 'login' ? sha.digest().toHex() : ''),
      action: action
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
        console.log('logged');
        setCookies(responseData.responseData);
        setFormData(initialFormState);
        setModalOpen(false);
        navigate("/registration");
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
      { action === 'login' ?
      <section>
        <MDBTypography tag="h4" className="mb-4 text-start">
          Přihlášení
        </MDBTypography>

        <form onSubmit={handleSubmit}>
          <MDBCol md="4">
            <MDBRow >
              <MDBInput
                  name="email"
                  id="email"
                  onChange={handleChange}
                  value={formData.email}
                  type="email"
                  wrapperClass="mb-4"
                  label="Email"
                  required autoComplete="email"
              />
            </MDBRow>
            <MDBRow md="4">
              <MDBInput
                  name="password"
                  id="password"
                  onChange={handleChange}
                  value={formData.password}
                  type="password"
                  wrapperClass="mb-4"
                  label="Heslo"
                  required autoComplete="current-password"
              />
            </MDBRow>
            <MDBRow className="mt-4">
              <MDBBtn type="submit" className="btn-block">
                Přihlásit
              </MDBBtn>
            </MDBRow>
            <MDBRow className="mt-4">
              <MDBBtn color='link' onClick={() => setAction('forgotpassword')}>
                Zapomenuté heslo
              </MDBBtn>
            </MDBRow>
          </MDBCol>
        </form>
      </section>
      : 
      <section>
        <MDBTypography tag="h4" className="mb-4 text-start">
          Obnovení hesla
        </MDBTypography>

        <form onSubmit={handleSubmit}>
          <MDBCol md="4">
            <MDBRow >
              <MDBInput
                  name="email"
                  id="email"
                  onChange={handleChange}
                  value={formData.email}
                  type="email"
                  wrapperClass="mb-4"
                  label="Email"
                  required autoComplete="email"
              />
            </MDBRow>
            <MDBRow className="mt-4">
              <MDBBtn type="submit" className="btn-block">
                Obnovit
              </MDBBtn>
            </MDBRow>
            <MDBRow className="mt-4">
              <MDBBtn color='link' onClick={() => setAction('login')}>
                Přihlaste se
              </MDBBtn>
            </MDBRow>
          </MDBCol>
        </form>
      </section>
    }

      <MDBModal open={modalOpen} tabIndex="-1">
        <MDBModalDialog centered>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{loading ? "Povádím přihlášení..." : isError ? "Chyba" : "Úspěch"}</MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody className="text-center">
              {loading ? <MDBSpinner role="status" /> : <p>{message}</p>}
            </MDBModalBody>
            {!loading && (
              <MDBModalFooter>
                <MDBBtn color="secondary" onClick={() => setModalOpen(false)}>
                  Zavřít
                </MDBBtn>
              </MDBModalFooter>
            )}
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>
  );
};

export default Login;