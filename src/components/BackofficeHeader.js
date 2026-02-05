import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../Header.css';
import {
  MDBContainer,
  MDBBtn,
  MDBNavbar,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarToggler,
  MDBIcon,
  MDBCollapse,
  MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem
} from 'mdb-react-ui-kit';
import {getToken, getUserName, apiBaseUrl} from '../services/connection.js';

const Header = ({ menuItems, logout }) => {
  const navigate = useNavigate();

  const [navItems, setNavItems] = useState([]);
  const [showNav, setShowNav] = useState(false);

  // Fetch navigation items from JSON file
  useEffect(() => {
    fetch("../backofficeNavItems.json")
      .then((res) => res.json())
      .then((data) => {
        setNavItems(data);
      });
  }, []);
  
  return (
    <MDBContainer className="header-container">

        {/* Navigační menu */}
        <MDBNavbar expand="lg" light bgColor="light">
          <MDBContainer fluid>
            <MDBNavbarToggler
              aria-label="Otevřít menu"
              onClick={() => setShowNav(!showNav)}
              aria-controls='navbarSupportedContent'
            >
              <MDBIcon icon="bars" fas />
            </MDBNavbarToggler>

            <MDBCollapse id="navbarNav" open={showNav} navbar>
              <MDBNavbarNav className='mb-2 mb-lg-0'>
                {navItems.map((item) => (
                  <MDBNavbarItem key={item.path}>
                    <NavLink
                      className='nav-link'
                      to={(item.backoffice ? apiBaseUrl + item.path +'&token='+ getToken() : item.path) }
                      {...(item.external ? { target: '_blank' } : {})}
                      onClick={() => setShowNav(false)}
                    >
                      {item.label}
                    </NavLink>
                  </MDBNavbarItem>
                ))}
              </MDBNavbarNav>
              {getToken().length === 0 ? (
                <MDBBtn color='light' onClick={() => {setShowNav(false); navigate("/backoffice/login")}}>
                  Přihlášení
                </MDBBtn>
              ) : (
                <MDBDropdown>
                  <MDBDropdownToggle tag='a' className='nav-link' role='button'>
                    <MDBIcon icon='user' className='ms-2' /> {getUserName() || 'Uživatel'}
                  </MDBDropdownToggle>
                  <MDBDropdownMenu>
                    {menuItems.map((item) => (
                      item.addDivider ? 
                        <MDBDropdownItem divider key={item.right}/> 
                      : 
                        <MDBDropdownItem link childTag='button' key={item.right}
                          onClick={() => {
                            if (item.path === 'logout')
                              logout();
                            else
                              navigate(item.path);
                            setShowNav(false);
                            }}
                          ><div>{item.label}</div>
                        </MDBDropdownItem>
                    ))}
                  </MDBDropdownMenu>
                </MDBDropdown>
              )}
            </MDBCollapse>
          </MDBContainer>
        </MDBNavbar>
      </MDBContainer>
  );
};

export default Header;
