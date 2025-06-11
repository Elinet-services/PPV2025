import { createContext, useState, useEffect } from "react";
import {getToken, getRights} from '../shared/components/connection.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [isLoggedIn, setIsLoggedIn] = useState(getToken().length > 0);
  const [userRights, setUserRights] = useState(getRights().split(','));

  useEffect(() => {
    const checkLogin = () => {
        //  Kontrola loginu pri zmene statusu prihlaseni
        setIsLoggedIn(getToken().length > 0)
        setUserRights(getRights().split(','));
    };

    window.addEventListener("loginStatusChanged", checkLogin);
    return () => window.removeEventListener("loginStatusChanged", checkLogin);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userRights, setUserRights }}>
      {children}
    </AuthContext.Provider>
  );
};