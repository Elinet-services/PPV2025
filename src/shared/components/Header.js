import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBCarousel,
  MDBCarouselItem,
  MDBCarouselCaption,
  MDBBtn,
  MDBRow,
  MDBCol,
  MDBNavbar,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarToggler,
  MDBIcon,
  MDBCollapse,
  MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem
} from 'mdb-react-ui-kit';
import {getOperatorLevel, getUserName, geRights} from './connection.js';
import { AuthContext } from "../../context/AuthContext.js";

const LOGO_WIDTHS = {
  aklt: '50%',
  akhb: '34%',
  hb: '40%',
};

const carouselItems = [
  { id: 1, img: "/img/1_pic.jpg", caption: "První snímek" },
  { id: 2, img: "/img/2_pic.jpg", caption: "Druhý snímek" },
  { id: 3, img: "/img/3_pic.jpg", caption: "Třetí snímek" }
];

const organizers = [
  { id: 'aklt', src: "/img/logo-AKLT.gif", alt: "AK Letňany", link: "https://www.akletnany.cz/" },
  { id: 'akhb', src: "/img/logo-AKHB.gif", alt: "AK Havlíčkův Brod", link: "https://aeroklubhb.cz/" },
  { id: 'hb', src: "/img/logo-HB.gif", alt: "Havlíčkův Brod", link: "https://www.muhb.cz/" }
];

const Header = () => {
  const [showNav, setShowNav] = useState(false);
  const [navItems, setNavItems] = useState([]);
  const [userMenuItems, setUserMenuItems] = useState([]);
  const { isLoggedIn } = useContext(AuthContext);
  const { userRights } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch navigation items from JSON file
  useEffect(() => {
    fetch("/navItems.json")
      .then((res) => res.json())
      .then((data) => {
        setNavItems(data);
      });
  }, [isLoggedIn]);

  // Fetch user menu items based on user rights
  useEffect(() => {
    fetch("/userMenuItems.json")
      .then((res) => res.json())
      .then((data) => {
        // Filter items based on authentication status
        const filteredItems = data.filter(item => {
          if (userRights.indexOf(item.right) === -1) return false;  // User does not have the right          
          return true;
        });
        setUserMenuItems(filteredItems);
      });
  }, [userRights]);

  return (
    <MDBContainer className="header-container" style={{ position: 'relative', marginBottom: '20px', overflow: 'hidden' }}>
      {/* Logo */}
      <a href="/" className="carousel-logo-link">
        <img
          src="/img/ppv 2025 png.png"
          alt="Plachtařský Pohár Vysočiny 2025"
          style={{
            width: '22%',
            maxWidth: '500px',
            height: 'auto',
            position: 'absolute',
            top: '4%',
            left: '3%',
            zIndex: 10,
            opacity: 0.9,
            padding: '1px',
            borderRadius: '3px',
          }}
        />
      </a>

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at top left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0) 65%)',
        zIndex: 5,
        pointerEvents: 'none',
      }} />

      {/* Carousel */}
      <MDBCarousel showIndicators showControls fade interval={11000}>
        {carouselItems.map(slide => (
          <MDBCarouselItem key={slide.id} itemId={slide.id}>
            <img src={slide.img} alt={`Slide ${slide.id}`} className="d-block w-100" style={{ height: '400px', objectFit: 'cover' }} />
            <MDBCarouselCaption>
              <img
                src="/img/CarouselText.png"
                alt="PPV 2025 Text"
                style={{
                  width: '60%',
                  maxWidth: '600px',
                  height: 'auto',
                  position: 'absolute',
                  bottom: '400%',
                  left: '80%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                }}
              />
            </MDBCarouselCaption>
          </MDBCarouselItem>
        ))}
      </MDBCarousel>

      {/* Navigační menu */}
      <MDBNavbar expand="lg" light bgColor="light">
        <MDBContainer>
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
                    className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
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

      {/* Organizátoři sekce */}
      {location.pathname === "/" && (
        <MDBContainer className="mt-4">
          <MDBRow className="justify-content-center align-items-center">
            {organizers.map(org => (
              <MDBCol key={org.id} size="12" sm="4" className="text-center mb-4">
                <a href={org.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={org.src}
                    alt={org.alt}
                    className="img-fluid"
                    style={{ width: LOGO_WIDTHS[org.id] || '100%', height: 'auto' }}
                  />
                </a>
              </MDBCol>
            ))}
          </MDBRow>
        </MDBContainer>
      )}
    </MDBContainer>
  );
};

export default Header;