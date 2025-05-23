import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MDBContainer,
  MDBCarousel,
  MDBCarouselItem,
  MDBCarouselCaption,
  MDBRow,
  MDBCol,
  MDBNavbar,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarToggler,
  MDBIcon,
  MDBCollapse
} from 'mdb-react-ui-kit';
import {getToken} from './connection.js';

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
  const location = useLocation();

  useEffect(() => {
    fetch("/navItems.json")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.map(item => {
          if (item.authDependent) {
            return getToken().length > 0
              ? { path: "/logout", label: "Odhlásit" }
              : { path: "/login", label: "Přihlásit" };
          }
          return item;
        });
        setNavItems(filtered);
      });
    }, []);

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
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setShowNav(!showNav)}
            aria-controls="navbarNav"
            aria-expanded={showNav}
          >
            <MDBIcon icon="bars" fas />
          </MDBNavbarToggler>

          <MDBCollapse id="navbarNav" open={showNav} navbar className="collapse navbar-collapse">
            <MDBNavbarNav className="ms-auto">
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