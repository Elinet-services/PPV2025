import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import processRequest, { resetCookies } from './connection.js';

let isLogged = true;

const Logout = (params) => {

  const navigate = useNavigate();  
  useEffect(() => {
    if (isLogged) {
      isLogged = false;
      doLogout();
    }
  })

  const doLogout = async (e) => {

    let response = await processRequest({}, 'logout', params.setLoading, params.setMessage, params.setError, params.showAlerMessage);
    
    if (!response.isError) {
      resetCookies();
      navigate("/");
    }
  };
}

export default Logout;