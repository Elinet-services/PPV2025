import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetCookies, getToken, apiBaseUrl, domainName} from './connection.js';


const Logout = () => {
  const navigate = useNavigate();  
  useEffect(() => {
    doLogout();
  })

  const doLogout = async() => {
    const formData = {
      "action":   'logout',
      "token":    getToken(),
      "domain":   domainName,
      "source":   'testLogout'
    }
  
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
      resetCookies();
      navigate("/");
    })
    .catch((e) => {
      console.log(e.message)
    })
  };
}

export default Logout;