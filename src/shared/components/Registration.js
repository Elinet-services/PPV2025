import React, { useState, useEffect } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBRadio,
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
import { useNavigate } from "react-router-dom";
import SHA256 from "crypto-js/sha256";
import {apiBaseUrl, domainName, getToken} from './connection.js';


const initialFormState = {
  domain: domainName,
  action: "registration",
  name: "",
  surname: "",
  email: "",
  phone: "",
  club: "",
  glider: "",
  imatriculation: "",
  startCode: "",
  gliderClass: "club",
  source: "testRegisterForm",
};

const Registration = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogged, setLogged] = useState(getToken().length > 0);
  const navigate = useNavigate();
  let dataLoaded = false;

  //  -------------------------------------------------------------------------------
  //  volani DB pro uvodni nacteni z DB
  useEffect(() => {
    if (isLogged && !dataLoaded) {
      dataLoaded = true;
      loadData();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      gliderClass: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsError(false);
    setLoading(true);
    setModalOpen(true);

    try {
      if (!isLogged) {
        const checkEmailUrl = `${apiBaseUrl}?action=checkemail&email=${encodeURIComponent(formData.email)}`;
        const checkEmailResponse = await fetch(checkEmailUrl);
        const emailCheckResult = await checkEmailResponse.json();

        if (emailCheckResult.responseData?.emailExists) {
          setMessage("Emailová adresa je již použita. Máte možnost ji změnit nebo kontaktovat organizátory.");
          setIsError(true);
          setLoading(false);
          return;
        }
      }

      const updatedFormData = {
        ...formData,
        password: SHA256("motorola").toString(),
        token: getToken()
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
          setMessage(isLogged ? "Údaje byly změněny" : "Registrace byla přijata, můžete ji zkontrolovat v seznamu závodníků.");
          document.querySelectorAll("input").forEach((input) => (input.value = ""));
        } else
          setMessage(responseData.message);
        setIsError(responseData.isError);
      })
      .catch((e) => {
        console.log(e.message)
        setIsError(true);
        setMessage("Kritická chyba: "+ e.message);    
      })
/*      if (!error && 1 == 2) { //  ???
        await new Promise((resolve) => setTimeout(resolve, 500));

        const getUrl = `${apiBaseUrl}?action=racerlist&domain=ppvcup2024&email=${encodeURIComponent(formData.email)}`;
        const getResponse = await fetch(getUrl);
        const result = await getResponse.json();
        
        if (result.isError) {
          setMessage("Registrace byla přijata, můžete ji zkontrolovat v seznamu závodníků.");
          setIsError(false);
        } else {
          setMessage("Registrace úspěšně odeslána.");
          setIsError(false);
        }
      }
*/
    } catch (error) {
      console.error("Chyba při registraci:", error);
      setMessage(`Chyba při komunikaci se serverem: ${error.message}`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  //  -------------------------------------------------------------------------------
  //  prijme data z DB
  async function loadData()
  {
    console.log('loadData');
    const formData = {
      "action":   'getuserdata',
      "token":    getToken(),
      "domain":   domainName,
      "source":   'testRegisterForm'
    }

    setIsError(false);
    setLoading(true);
    setModalOpen(true);

    await fetch(apiBaseUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(formData)
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
        const userParams = responseData.responseData.userParameters[domainName];
        setFormData(
          {
            domain: domainName,
            action: "edit",
            name: userParams.name,
            surname: userParams.surname,
            email: responseData.responseData.email,
            phone: userParams.phone,
            club: userParams.club,
            glider: userParams.glider,
            imatriculation: userParams.imatriculation,
            startCode: userParams.startCode,
            gliderClass: userParams.gliderClass,
            source: "testEditForm",
          }
        );
        setModalOpen(false);
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
  }

  return (
    <MDBContainer className="my-5">
      <MDBTypography tag="h4" className="mb-4 text-start">
        Registrační formulář
      </MDBTypography>

      <form onSubmit={handleSubmit}>
        <MDBRow>
          <MDBCol md="4">
            <MDBInput label="Jméno" name="name" value={formData.name} onChange={handleChange} autoComplete="given-name" required />
          </MDBCol>
          <MDBCol md="4">
            <MDBInput label="Příjmení" name="surname" value={formData.surname} onChange={handleChange} autoComplete="family-name" required />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="5">
            <MDBInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" required readonly={isLogged} />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label="Telefon" type="tel" name="phone" value={formData.phone} onChange={handleChange} autoComplete="tel" required />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="5">
            <MDBInput label="Aeroklub" name="club" value={formData.club} onChange={handleChange} />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-3">
          <MDBCol md="4">
            <MDBInput label="Typ letadla" name="glider" value={formData.glider} onChange={handleChange} />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label="Imatrikulace" name="imatriculation" value={formData.imatriculation} onChange={handleChange} />
          </MDBCol>
          <MDBCol md="3">
            <MDBInput label="Startovní znak" name="startCode" value={formData.startCode} onChange={handleChange} />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-4">
          <MDBCol md="12">
            <label className="form-label">Třída větroně:</label>
            <MDBRadio name="gliderClass" id="gliderClassClub" label="Klubová třída" value="club" checked={formData.gliderClass === "club"} onChange={handleRadioChange} />
            <MDBRadio name="gliderClass" id="gliderClassCombi" label="Kombinovaná třída" value="combi" checked={formData.gliderClass === "combi"} onChange={handleRadioChange} />
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-4">
          <MDBCol md="4">
            <MDBBtn type="submit" className="btn-block">
              Odeslat registraci
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </form>

      <MDBModal open={modalOpen} tabIndex="-1">
        <MDBModalDialog centered>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{loading ? "Zpracováváme vaši registraci..." : isError ? "Chyba" : "Úspěch"}</MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody className="text-center">
              {loading ? <MDBSpinner role="status" /> : <p>{message}</p>}
            </MDBModalBody>
            {!loading && (
              <MDBModalFooter>
                <MDBBtn color="secondary" onClick={() => setModalOpen(false)}>
                  Zavřít
                </MDBBtn>
                <MDBBtn color="primary" onClick={() => navigate("/")}>
                  Jít na hlavní stránku
                </MDBBtn>
              </MDBModalFooter>
            )}
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>
  );
};

export default Registration;