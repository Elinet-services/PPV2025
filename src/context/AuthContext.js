import { createContext, useState, useEffect } from "react";
import {getToken} from '../shared/components/connection.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [isLoggedIn, setIsLoggedIn] = useState(getToken().length > 0);

  useEffect(() => {
    const checkLogin = () => {
        //  Kontrola loginu pri zmene statusu prihlaseni
        setIsLoggedIn(getToken().length > 0)
    };

    window.addEventListener("loginStatusChanged", checkLogin);
    return () => window.removeEventListener("loginStatusChanged", checkLogin);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};