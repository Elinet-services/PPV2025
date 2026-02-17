import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../Header.css";
import {
  MDBCol,
  MDBCollapse,
  MDBContainer,
  MDBDropdown,
  MDBDropdownItem,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBIcon,
  MDBNavbar,
  MDBNavbarItem,
  MDBNavbarNav,
  MDBNavbarToggler,
  MDBRow,
} from "mdb-react-ui-kit";

import { apiBaseUrl, getToken, getUserName } from "../services/connection";
import LanguageSwitcher from "./LanguageSwitcher";

const BackofficeHeader = ({ menuItems, logout }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [navItems, setNavItems] = useState([]);
  const [showNav, setShowNav] = useState(false);

  const getLabel = (item) => {
    if (item.labelKey) return t(item.labelKey);
    return item.label;
  };

  useEffect(() => {
    fetch("/backofficeNavItems.json")
      .then((res) => res.json())
      .then((data) => setNavItems(data))
      .catch(() => setNavItems([]));
  }, []);

  return (
    <MDBContainer className="header-container backoffice-header-container">
      <MDBNavbar expand="lg" light bgColor="light">
        <MDBContainer fluid>
          <MDBRow className="w-100 align-items-center g-0">
            <MDBCol md="9" className="d-flex align-items-center">
              <MDBNavbarToggler
                aria-label={t("nav.openMenu")}
                onClick={() => setShowNav(!showNav)}
                aria-controls="navbarSupportedContent"
              >
                <MDBIcon icon="bars" fas />
              </MDBNavbarToggler>

              <MDBCollapse id="navbarNav" open={showNav} navbar className="flex-grow-1">
                <MDBNavbarNav className="mb-2 mb-lg-0">
                  {navItems.map((item) => (
                    <MDBNavbarItem key={item.path}>
                      <NavLink
                        className="nav-link"
                        to={item.backoffice ? `${apiBaseUrl}${item.path}&token=${getToken()}` : item.path}
                        {...(item.external ? { target: "_blank" } : {})}
                        onClick={() => setShowNav(false)}
                      >
                        {getLabel(item)}
                      </NavLink>
                    </MDBNavbarItem>
                  ))}
                </MDBNavbarNav>
              </MDBCollapse>
            </MDBCol>

            <MDBCol md="3" className="d-flex justify-content-end align-items-center gap-2">
              {getToken().length === 0 ? (
                <NavLink
                  className="nav-link nav-link-auth"
                  to="/backoffice/login"
                  onClick={() => {
                    setShowNav(false);
                    navigate("/backoffice/login");
                  }}
                >
                  {t("nav.login")}
                </NavLink>
              ) : (
                <MDBDropdown>
                  <MDBDropdownToggle tag="a" className="nav-link nav-link-auth" role="button">
                    <MDBIcon icon="user" className="ms-2" /> {getUserName() || t("common.userFallback")}
                  </MDBDropdownToggle>
                  <MDBDropdownMenu>
                    {menuItems.map((item) =>
                      item.addDivider ? (
                        <MDBDropdownItem divider key={item.right} />
                      ) : (
                        <MDBDropdownItem
                          link
                          childTag="button"
                          key={item.right}
                          onClick={() => {
                            if (item.path === "logout") logout();
                            else navigate(item.path);
                            setShowNav(false);
                          }}
                        >
                          <div>{getLabel(item)}</div>
                        </MDBDropdownItem>
                      )
                    )}
                  </MDBDropdownMenu>
                </MDBDropdown>
              )}
              <LanguageSwitcher compact />
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </MDBNavbar>
    </MDBContainer>
  );
};

export default BackofficeHeader;
