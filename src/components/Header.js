import { useContext, useState, useEffect } from 'react';
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
import {getToken, getUserName} from '../services/connection.js';
import { AppContext } from '../App.js';

const carouselItems = [
  { id: 1, img: "/img/1_pic.jpg", caption: "První snímek" },
  { id: 2, img: "/img/2_pic.jpg", caption: "Druhý snímek" },
  { id: 3, img: "/img/3_pic.jpg", caption: "Třetí snímek" }
];

const Header = () => {
  const app = useContext(AppContext);
  const navigate = useNavigate();

  const [userMenuItems, setUserMenuItems] = useState([]);               //  položky menu pro uživatele
  const [navItems, setNavItems] = useState([]);
  const [showNav, setShowNav] = useState(false);

   // Fetch user menu items based on user rights
  useEffect(() => {
    fetch("/userMenuItems.json")
      .then((res) => res.json())
      .then((data) => {
        console.log(app.userRights);
        
        // Filter items based on authentication status
        const filteredItems = data.filter(item => {
          if (item.addDivider) return true; // oddelovac
          if (app.userRights.indexOf(item.right) === -1) return false;  // User does not have the right          
          return true;
        });
        setUserMenuItems(filteredItems);
      });
  }, [app.userRights]);


  // Fetch navigation items from JSON file
  useEffect(() => {
    fetch("../userNavItems.json")
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
          alt="Plachtařský Pohár Vysočiny 2026"
          style={{
            width: '22%', maxWidth: '500px', height: 'auto', position: 'absolute',
            top: '10px', left: '3%', zIndex: 10, opacity: 0.9, padding: '1px', borderRadius: '3px',
          }}
        />
      </a>
      <img
        src="/img/CarouselText.png"
        alt="PPV 2026"
        style={{
          width: '40%', maxWidth: '600px', height: 'auto', position: 'absolute', 
          top: '150px', left: '70%', transform: 'translateX(-50%)', zIndex: 10,
        }}
      />

      {/* Carousel */}
      <MDBCarousel showIndicators showControls fade interval={11000}>
        {carouselItems.map(slide => (
          <MDBCarouselItem key={slide.id} itemId={slide.id}>
            <img src={slide.img} alt={`Slide ${slide.id}`} className="d-block w-100" style={{ height: '400px', objectFit: 'cover'}} />
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
                      className='nav-link fw-bold'
                      to={item.path}
                       {...(item.external ? { target: '_blank' } : {})}
                      onClick={() => setShowNav(false)}
                    >
                      {item.label}
                    </NavLink>
                  </MDBNavbarItem>
                ))}
              </MDBNavbarNav>
              {getToken().length === 0 ? (
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
                      item.addDivider ? 
                        <MDBDropdownItem divider key={item.right}/> 
                      : 
                        <MDBDropdownItem link childTag='button' key={item.right}
                          onClick={() => {
                            if (item.path === 'logout')
                              app.logout();
                            else
                              navigate(item.path);
                            setShowNav(false);
                            }}
                          ><div class="fw-bold">{item.label}</div>
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