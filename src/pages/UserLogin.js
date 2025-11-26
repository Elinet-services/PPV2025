import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
  MDBTypography
} from "mdb-react-ui-kit";
import { sha256 } from "node-forge";
import {processRequest, setCookies, resetCookies} from '../services/connection.js';

const initialFormState = {
  email: "",
  password: ""
};

const Login = (params) => {
  const [formData, setFormData] = useState(initialFormState);
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

    const sha = sha256.create().update(formData.email + formData.password);
  
    const updatedFormData = {
      ...formData,
      password: (action === 'login' ? sha.digest().toHex() : '')
    };

    let response = await processRequest(updatedFormData, action, params.setLoading, params.setMessage, params.setError, params.showAlerMessage);

    if (!response.isError) {
      if (action === 'login') {
        setCookies(response.responseData);
        setFormData(initialFormState);
        params.setUserRights(response.responseData.rights);
        if (response.responseData.role == 'A')
          navigate("/backoffice");
        else
          navigate("/");
      }
    }
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
    </MDBContainer>
  );
};

export default Login;