import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBCarousel,
  MDBCarouselItem,
  MDBBtn,
  MDBNavbar,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarToggler,
  MDBIcon,
  MDBCollapse,
  MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem
} from 'mdb-react-ui-kit';
import {getOperatorLevel, getUserName} from '../services/connection.js';

const carouselItems = [
  { id: 1, img: "/img/1_pic.jpg", caption: "První snímek" },
  { id: 2, img: "/img/2_pic.jpg", caption: "Druhý snímek" },
  { id: 3, img: "/img/3_pic.jpg", caption: "Třetí snímek" }
];


const Header = ({ userMenuItems }) => {
  const navigate = useNavigate();

  const [navItems, setNavItems] = useState([]);
  const [showNav, setShowNav] = useState(false);

  // Fetch navigation items from JSON file
  useEffect(() => {
    fetch("../navItems.json")
      .then((res) => res.json())
      .then((data) => {
        setNavItems(data);
      });
  }, []);
  
  return (
    <MDBContainer className="header-container">
      {/* Logo */}
      <a href="/" className="carousel-logo-link">
        <img
          src="/img/ppv 2025 png.png"
          alt="Plachtařský Pohár Vysočiny 2025"
          style={{
            width: '22%', maxWidth: '500px', height: 'auto', position: 'absolute',
            top: '4%', left: '3%', zIndex: 10, opacity: 0.9, padding: '1px', borderRadius: '3px',
          }}
        />
      </a>
      <img
        src="/img/CarouselText.png"
        alt="PPV 2025 Text"
        style={{
          width: '40%', maxWidth: '600px', height: 'auto', position: 'absolute', 
          bottom: '50%', left: '70%', transform: 'translateX(-50%)', zIndex: 10,
        }}
      />

      {/* Carousel */}
      <MDBCarousel showIndicators showControls fade interval={11000}>
        {carouselItems.map(slide => (
          <MDBCarouselItem key={slide.id} itemId={slide.id}>
            <img src={slide.img} alt={`Slide ${slide.id}`} className="d-block w-100" 
              style={{ height: '400px', objectFit: 'cover'}} />
            <div className='carousel-gradient-overlay'/>
          </MDBCarouselItem>
        ))}
      </MDBCarousel>
        {/* Navigační menu */}
        <MDBNavbar expand="lg" light bgColor="light">
          <MDBContainer fluid>
            <NavLink className="navbar-brand" to="/">
              <MDBIcon fas icon="home" size="lg" />
            </NavLink>

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
                      to={item.path}
                      onClick={() => setShowNav(false)}
                    >
                      {item.label}
                    </NavLink>
                  </MDBNavbarItem>
                ))}
              </MDBNavbarNav>
              {getOperatorLevel() === 'N' ? (
                <MDBBtn color='light' onClick={() => {setShowNav(false); navigate("/login")}}>
                  Přihlášení
                </MDBBtn>
              ) : (
                <MDBDropdown>
                  <MDBDropdownToggle tag='a' className='nav-link' role='button'>
                    <MDBIcon icon='user' className='ms-2' /> {getUserName() || 'Uživatel'} 
                  </MDBDropdownToggle>
                  <MDBDropdownMenu>
                    {userMenuItems.map((item) => (
                      <React.Fragment key={item.path}>
                        {item.addDivider && <MDBDropdownItem divider />}
                        <MDBDropdownItem link childTag='button' onClick={() => {navigate(item.path)}}>
                          {item.label}
                        </MDBDropdownItem>
                      </React.Fragment>
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