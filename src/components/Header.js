import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../Header.css";
import {
  MDBBtn,
  MDBCarousel,
  MDBCarouselItem,
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

import { AppContext } from "../App";
import LanguageSwitcher from "./LanguageSwitcher";
import { getToken, getUserName } from "../services/connection";

const carouselItems = [
  { id: 1, img: "/img/1_pic.jpg" },
  { id: 2, img: "/img/2_pic.jpg" },
  { id: 3, img: "/img/3_pic.jpg" },
];

const FALLBACK_PUBLIC_FROM = null;

const Header = () => {
  const app = useContext(AppContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [userMenuItems, setUserMenuItems] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [showNav, setShowNav] = useState(false);
  const [publicFromIso, setPublicFromIso] = useState(FALLBACK_PUBLIC_FROM);
  const [showPublic, setShowPublic] = useState(false);

  const isLoggedIn = getToken().length > 0;

  const getItemLabel = (item) => {
    if (isLoggedIn && item.path === "/registration") {
      return t("nav.registrationEdit");
    }
    if (item.labelKey) {
      return t(item.labelKey);
    }
    return item.label;
  };

  const getMenuLabel = (item) => {
    if (item.labelKey) {
      return t(item.labelKey);
    }
    return item.label;
  };

  const shouldShowNavItem = (item) => {
    if (showPublic) return true;
    return isLoggedIn && item.path === "/registration";
  };

  useEffect(() => {
    fetch("/userMenuItems.json")
      .then((res) => res.json())
      .then((data) => {
        const filteredItems = data.filter((item) => {
          if (item.addDivider) return true;
          return app.userRights.indexOf(item.right) !== -1;
        });
        setUserMenuItems(filteredItems);
      })
      .catch(() => setUserMenuItems([]));
  }, [app.userRights]);

  useEffect(() => {
    const loadNavConfig = async () => {
      const res = await fetch("/userNavItems.json");
      const data = await res.json();

      if (data && typeof data === "object" && Array.isArray(data.items)) {
        setPublicFromIso(data.publicFrom ?? FALLBACK_PUBLIC_FROM);
        setNavItems(data.items);
        return;
      }

      if (Array.isArray(data)) {
        setPublicFromIso(null);
        setNavItems(data);
        return;
      }

      setPublicFromIso(FALLBACK_PUBLIC_FROM);
      setNavItems([]);
    };

    loadNavConfig().catch(() => {
      setPublicFromIso(FALLBACK_PUBLIC_FROM);
      setNavItems([]);
    });
  }, []);

  useEffect(() => {
    let timerId;

    const updateVisibility = () => {
      if (!publicFromIso) {
        setShowPublic(true);
        return;
      }

      const nowMs = Date.now();
      const showAt = new Date(publicFromIso).getTime();

      setShowPublic(nowMs >= showAt);

      if (showAt > nowMs) {
        timerId = window.setTimeout(updateVisibility, showAt - nowMs + 50);
      }
    };

    updateVisibility();

    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, [publicFromIso]);

  return (
    <MDBContainer className="header-container">
      <a href="/" className="carousel-logo-link">
        <img
          src="/img/ppv 2025 png.png"
          alt="Plachtařský Pohár Vysočiny 2026"
          className="carousel-logo"
          decoding="async"
        />
      </a>

      <img src="/img/CarouselText.png" alt="PPV 2026" className="carousel-caption-image" decoding="async" />

      <MDBCarousel showIndicators showControls fade interval={11000}>
        {carouselItems.map((slide) => (
          <MDBCarouselItem key={slide.id} itemId={slide.id}>
            <img
              src={slide.img}
              alt={`Slide ${slide.id}`}
              className="d-block w-100 carousel-image"
              loading={slide.id === 1 ? "eager" : "lazy"}
              decoding="async"
            />
            <div className="carousel-gradient-overlay" />
          </MDBCarouselItem>
        ))}
      </MDBCarousel>

      <MDBNavbar expand="lg" light bgColor="light" className="d-none d-md-block">
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
                  <MDBNavbarItem>
                    <NavLink className="nav-link" to="/" aria-label={t("nav.home")} onClick={() => setShowNav(false)}>
                      <MDBIcon fas icon="house" className="home-nav-icon" />
                    </NavLink>
                  </MDBNavbarItem>

                  {navItems.filter(shouldShowNavItem).map((item) => (
                    <MDBNavbarItem key={item.path} className={item.path === "/navody" ? "nav-item-guides ms-auto" : ""}>
                      <NavLink
                        className={`nav-link ${item.path === "/navody" ? "nav-link-guides" : ""}`}
                        to={item.path}
                        {...(item.external ? { target: "_blank" } : {})}
                        onClick={() => setShowNav(false)}
                      >
                        {getItemLabel(item)}
                      </NavLink>
                    </MDBNavbarItem>
                  ))}
                </MDBNavbarNav>
              </MDBCollapse>
            </MDBCol>

            <MDBCol md="3" className="d-flex justify-content-end align-items-center gap-2">
              {!isLoggedIn ? (
                showPublic ? (
                  <NavLink className="nav-link nav-link-auth" to="/login" onClick={() => setShowNav(false)}>
                    {t("nav.login")}
                  </NavLink>
                ) : null
              ) : (
                <MDBDropdown>
                  <MDBDropdownToggle tag="a" className="nav-link nav-link-auth" role="button">
                    <MDBIcon icon="user" className="ms-2" /> {getUserName() || t("common.userFallback")}
                  </MDBDropdownToggle>
                  <MDBDropdownMenu>
                    {userMenuItems.map((item) =>
                      item.addDivider ? (
                        <MDBDropdownItem divider key={item.right} />
                      ) : (
                        <MDBDropdownItem
                          link
                          childTag="button"
                          key={item.right}
                          onClick={() => {
                            if (item.path === "logout") app.logout();
                            else navigate(item.path);
                            setShowNav(false);
                          }}
                        >
                          <div>{getMenuLabel(item)}</div>
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

      <div className="carousel-menu d-md-none">
        <MDBBtn
          color="light"
          size="sm"
          className="carousel-menu-toggle"
          aria-label={t("nav.openMenu")}
          onClick={() => setShowNav(!showNav)}
        >
          <MDBIcon icon="bars" fas />
        </MDBBtn>

        {showNav ? <div className="carousel-menu-backdrop" onClick={() => setShowNav(false)} aria-hidden="true" /> : null}

        <MDBCollapse id="carouselNav" open={showNav} className="carousel-menu-panel">
          <div className="carousel-menu-items">
            <div className="d-flex justify-content-end mb-2">
              <LanguageSwitcher compact />
            </div>

            <NavLink className="nav-link" to="/" onClick={() => setShowNav(false)}>
              {t("nav.home")}
            </NavLink>

            {navItems.filter(shouldShowNavItem).map((item) => (
              <NavLink
                key={item.path}
                className={`nav-link ${item.path === "/navody" ? "nav-link-guides" : ""}`}
                to={item.path}
                {...(item.external ? { target: "_blank" } : {})}
                onClick={() => setShowNav(false)}
              >
                {getItemLabel(item)}
              </NavLink>
            ))}

            {!isLoggedIn ? (
              showPublic ? (
                <NavLink className="nav-link mt-2" to="/login" onClick={() => setShowNav(false)}>
                  {t("nav.login")}
                </NavLink>
              ) : null
            ) : (
              <MDBDropdown>
                <MDBDropdownToggle tag="a" className="nav-link" role="button">
                  <MDBIcon icon="user" className="ms-2" /> {getUserName() || t("common.userFallback")}
                </MDBDropdownToggle>
                <MDBDropdownMenu>
                  {userMenuItems.map((item) =>
                    item.addDivider ? (
                      <MDBDropdownItem divider key={item.right} />
                    ) : (
                      <MDBDropdownItem
                        link
                        childTag="button"
                        key={item.right}
                        onClick={() => {
                          if (item.path === "logout") app.logout();
                          else navigate(item.path);
                          setShowNav(false);
                        }}
                      >
                        <div>{getMenuLabel(item)}</div>
                      </MDBDropdownItem>
                    )
                  )}
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
