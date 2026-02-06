import { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../Header.css';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCarousel,
  MDBCarouselItem,
  MDBBtn,
  MDBNavbar,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarToggler,
  MDBIcon,
  MDBCollapse,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem
} from 'mdb-react-ui-kit';
import { getToken, getUserName } from '../services/connection.js';
import { AppContext } from '../App.js';

const carouselItems = [
  { id: 1, img: "/img/1_pic.jpg", caption: "PrvnĂ­ snĂ­mek" },
  { id: 2, img: "/img/2_pic.jpg", caption: "DruhĂ˝ snĂ­mek" },
  { id: 3, img: "/img/3_pic.jpg", caption: "TĹ™etĂ­ snĂ­mek" }
];

// Fallback, kdyby se JSON nepodaĹ™ilo naÄŤĂ­st (mĹŻĹľeĹˇ nechat null a pak zobrazit hned)
const FALLBACK_PUBLIC_FROM = null; // napĹ™. "2026-01-28T10:08:00+01:00"
const REGISTRATION_EDIT_LABEL = "Editace p\u0159ihl\u00e1\u0161ky z\u00e1vodn\u00edka";
const LOGIN_SUBLABEL = "(\u00faprava p\u0159ihl\u00e1\u0161ky)";

const Header = () => {
  const app = useContext(AppContext);
  const navigate = useNavigate();

  const [userMenuItems, setUserMenuItems] = useState([]); // poloĹľky menu pro uĹľivatele (po pĹ™ihlĂˇĹˇenĂ­)
  const [navItems, setNavItems] = useState([]);           // veĹ™ejnĂ© poloĹľky menu
  const [showNav, setShowNav] = useState(false);

  const [publicFromIso, setPublicFromIso] = useState(FALLBACK_PUBLIC_FROM);
  const [showPublic, setShowPublic] = useState(false);
  const isLoggedIn = getToken().length > 0;

  const getNavItemLabel = (item) => {
    if (isLoggedIn && item.path === "/registration") {
      return REGISTRATION_EDIT_LABEL;
    }
    return item.label;
  };

  const shouldShowNavItem = (item) => {
    if (showPublic) return true;
    return isLoggedIn && item.path === "/registration";
  };

  // Fetch user menu items based on user rights (dropdown po pĹ™ihlĂˇĹˇenĂ­)
  useEffect(() => {
    fetch("/userMenuItems.json")
      .then((res) => res.json())
      .then((data) => {
        const filteredItems = data.filter(item => {
          if (item.addDivider) return true;
          if (app.userRights.indexOf(item.right) === -1) return false;
          return true;
        });
        setUserMenuItems(filteredItems);
      });
  }, [app.userRights]);

  // NaÄŤti nav config + poloĹľky z userNavItems.json
  useEffect(() => {
    const loadNavConfig = async () => {
      const res = await fetch("/userNavItems.json");
      const data = await res.json();

      // oÄŤekĂˇvĂˇme novĂ˝ formĂˇt: { publicFrom, items: [...] }
      if (data && typeof data === "object" && Array.isArray(data.items)) {
        setPublicFromIso(data.publicFrom ?? FALLBACK_PUBLIC_FROM);
        setNavItems(data.items);
        return;
      }

      // fallback pro starĂ˝ formĂˇt (pole poloĹľek) â€“ v tom pĹ™Ă­padÄ› se nic neÄŤekĂˇ a zobrazĂ­ se hned
      if (Array.isArray(data)) {
        setPublicFromIso(null);
        setNavItems(data);
        return;
      }

      // kdyĹľ je to nÄ›co jinĂ©ho, radÄ›ji nic
      setPublicFromIso(FALLBACK_PUBLIC_FROM);
      setNavItems([]);
    };

    loadNavConfig().catch(() => {
      setPublicFromIso(FALLBACK_PUBLIC_FROM);
      setNavItems([]);
    });
  }, []);

  // ÄŚasovĂ© Ĺ™Ă­zenĂ­ viditelnosti (menu + PĹ™ihlĂˇĹˇenĂ­)
  useEffect(() => {
    let timerId;

    const updateVisibility = () => {
      // KdyĹľ nenĂ­ publicFromIso nastavenĂ˝, bereme to jako "zobraz hned"
      if (!publicFromIso) {
        setShowPublic(true);
        return;
      }

      const nowMs = Date.now();
      const showAt = new Date(publicFromIso).getTime();

      setShowPublic(nowMs >= showAt);

      if (showAt > nowMs) {
        timerId = window.setTimeout(updateVisibility, (showAt - nowMs) + 50);
      }
    };

    updateVisibility();

    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, [publicFromIso]);

  return (
    <MDBContainer className="header-container">
      {/* Logo */}
      <a href="/" className="carousel-logo-link">
        <img
          src="/img/ppv 2025 png.png"
          alt="PlachtaĹ™skĂ˝ PohĂˇr VysoÄŤiny 2026"
          className="carousel-logo"
          decoding="async"
        />
      </a>

      <img
        src="/img/CarouselText.png"
        alt="PPV 2026"
        className="carousel-caption-image"
        decoding="async"
      />

      {/* Carousel */}
      <MDBCarousel showIndicators showControls fade interval={11000}>
        {carouselItems.map(slide => (
          <MDBCarouselItem key={slide.id} itemId={slide.id}>
            <img
              src={slide.img}
              alt={`Slide ${slide.id}`}
              className="d-block w-100 carousel-image"
              loading={slide.id === 1 ? "eager" : "lazy"}
              decoding="async"
            />
            <div className='carousel-gradient-overlay' />
          </MDBCarouselItem>
        ))}
      </MDBCarousel>
      {/* NavigaĹˇnĂ­ menu (desktop) */}
      <MDBNavbar expand="lg" light bgColor="light" className="d-none d-md-block">
        <MDBContainer fluid>
          <MDBRow className="w-100 align-items-center g-0">
            <MDBCol md="9" className="d-flex align-items-center">
              <NavLink className="navbar-brand d-none d-md-inline-block" to="/">
                <MDBIcon fas icon="home" size="lg" />
              </NavLink>

              <MDBNavbarToggler
                aria-label={"Otev\u0159\u00edt menu"}
                onClick={() => setShowNav(!showNav)}
                aria-controls="navbarSupportedContent"
              >
                <MDBIcon icon="bars" fas />
              </MDBNavbarToggler>

              <MDBCollapse id="navbarNav" open={showNav} navbar className="flex-grow-1">
                <MDBNavbarNav className="mb-2 mb-lg-0">
                  {navItems.filter(shouldShowNavItem).map((item) => (
                    <MDBNavbarItem
                      key={item.path}
                      className={item.path === "/navody" ? "nav-item-guides ms-auto" : ""}
                    >
                      <NavLink
                        className={`nav-link ${item.path === "/navody" ? "nav-link-guides" : ""}`}
                        to={item.path}
                        {...(item.external ? { target: "_blank" } : {})}
                        onClick={() => setShowNav(false)}
                      >
                        {getNavItemLabel(item)}
                      </NavLink>
                    </MDBNavbarItem>
                  ))}
                </MDBNavbarNav>
              </MDBCollapse>
            </MDBCol>

            <MDBCol md="3" className="d-flex justify-content-end">
              {!isLoggedIn ? (
                showPublic ? (
                  <NavLink
                    className="nav-link"
                    to="/login"
                    onClick={() => setShowNav(false)}
                  >
                    <>
                      {"P\u0159ihl\u00e1\u0161en\u00ed"} <small>{LOGIN_SUBLABEL}</small>
                    </>
                  </NavLink>
                ) : null
              ) : (
                <MDBDropdown>
                  <MDBDropdownToggle tag="a" className="nav-link" role="button">
                    <MDBIcon icon="user" className="ms-2" /> {getUserName() || 'U\u017eivatel'}
                  </MDBDropdownToggle>
                  <MDBDropdownMenu>
                    {userMenuItems.map((item) => (
                      item.addDivider
                        ? <MDBDropdownItem divider key={item.right} />
                        : (
                          <MDBDropdownItem
                            link
                            childTag="button"
                            key={item.right}
                            onClick={() => {
                              if (item.path === 'logout') app.logout();
                              else navigate(item.path);
                              setShowNav(false);
                            }}
                          >
                            <div>{item.label}</div>
                          </MDBDropdownItem>
                        )
                    ))}
                  </MDBDropdownMenu>
                </MDBDropdown>
              )}
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </MDBNavbar>
      {/* NavigaĹˇnĂ­ menu (hamburger v carouselu) */}
      <div className="carousel-menu d-md-none">
        <MDBBtn
          color="light"
          size="sm"
          className="carousel-menu-toggle"
          aria-label="OtevĹ™Ă­t menu"
          onClick={() => setShowNav(!showNav)}
        >
          <MDBIcon icon="bars" fas />
        </MDBBtn>

        {showNav ? (
          <div
            className="carousel-menu-backdrop"
            onClick={() => setShowNav(false)}
            aria-hidden="true"
          />
        ) : null}

        <MDBCollapse id="carouselNav" open={showNav} className="carousel-menu-panel">
          <div className="carousel-menu-items">
            <NavLink
              className='nav-link'
              to="/"
              onClick={() => setShowNav(false)}
            >
              Home
            </NavLink>

            {navItems.filter(shouldShowNavItem).map((item) => (
              <NavLink
                key={item.path}
                className={`nav-link ${item.path === "/navody" ? "nav-link-guides" : ""}`}
                to={item.path}
                {...(item.external ? { target: '_blank' } : {})}
                onClick={() => setShowNav(false)}
              >
                {getNavItemLabel(item)}
              </NavLink>
            ))}

            {!isLoggedIn ? (
              showPublic ? (
                <NavLink
                  className="nav-link mt-2"
                  to="/login"
                  onClick={() => setShowNav(false)}
                >
                  <>
                    {"P\u0159ihl\u00e1\u0161en\u00ed"} <small>{LOGIN_SUBLABEL}</small>
                  </>
                </NavLink>
              ) : null
            ) : (
              <MDBDropdown>
                <MDBDropdownToggle tag='a' className='nav-link' role='button'>
                  <MDBIcon icon='user' className='ms-2' /> {getUserName() || 'UĹľivatel'}
                </MDBDropdownToggle>
                <MDBDropdownMenu>
                  {userMenuItems.map((item) => (
                    item.addDivider
                      ? <MDBDropdownItem divider key={item.right} />
                      : (
                        <MDBDropdownItem
                          link
                          childTag='button'
                          key={item.right}
                          onClick={() => {
                            if (item.path === 'logout') app.logout();
                            else navigate(item.path);
                            setShowNav(false);
                          }}
                        >
                          <div>{item.label}</div>
                        </MDBDropdownItem>
                      )
                  ))}
                </MDBDropdownMenu>
              </MDBDropdown>
            )}
          </div>
        </MDBCollapse>
      </div>
    </MDBContainer>
  );
};

export default Header;







