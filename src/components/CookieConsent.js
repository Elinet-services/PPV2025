import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MDBBtn, MDBCard, MDBCardBody, MDBTypography } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "ppv_cookie_consent_v1";
const CONSENT_EVENT = "ppv-cookie-consent-changed";

export function getCookieConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setCookieConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  } catch {
    // ignore
  }
}

export function clearCookieConsent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  } catch {
    // ignore
  }
}

const CookieConsent = () => {
  const { t } = useTranslation();
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    const update = () => setConsent(getCookieConsent());
    update();

    window.addEventListener("storage", update);
    window.addEventListener(CONSENT_EVENT, update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(CONSENT_EVENT, update);
    };
  }, []);

  const shouldShow = useMemo(() => !consent, [consent]);

  if (!shouldShow) return null;

  return (
    <div className="cookie-consent">
      <MDBCard className="cookie-consent-card shadow-3">
        <MDBCardBody>
          <MDBTypography tag="h6" className="mb-2 text-start">
            {t("cookieConsent.title")}
          </MDBTypography>
          <MDBTypography className="mb-3 text-start">
            {t("cookieConsent.text")} <Link to="/cookies">{t("cookieConsent.moreInfo")}</Link>.
          </MDBTypography>

          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <MDBBtn
              color="light"
              type="button"
              aria-label={t("cookieConsent.rejectOptional")}
              onClick={() => {
                setCookieConsent("necessary");
              }}
            >
              {t("cookieConsent.necessaryOnly")}
            </MDBBtn>
            <MDBBtn
              color="primary"
              type="button"
              aria-label={t("cookieConsent.allowAll")}
              onClick={() => {
                setCookieConsent("all");
              }}
            >
              {t("cookieConsent.allowAll")}
            </MDBBtn>
          </div>
        </MDBCardBody>
      </MDBCard>
    </div>
  );
};

export default CookieConsent;
