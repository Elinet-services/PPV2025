import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBContainer,
  MDBListGroup,
  MDBListGroupItem,
  MDBRow,
  MDBTypography,
} from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

import { clearCookieConsent, getCookieConsent } from "../components/CookieConsent";

const CookiePolicyPage = () => {
  const { t } = useTranslation();

  return (
    <MDBContainer className="my-5">
      <MDBTypography tag="h4" className="mb-3 text-start">
        {t("cookiePolicy.title")}
      </MDBTypography>

      <MDBTypography className="text-start mb-4">
        {t("cookiePolicy.summaryPrefix")} <a href="mailto:poradatel@ppvcup.cz">poradatel@ppvcup.cz</a>.
      </MDBTypography>

      <MDBRow className="g-4">
        <MDBCol lg="8">
          <MDBCard className="h-100">
            <MDBCardBody>
              <MDBTypography tag="h5" className="mb-2 text-start">
                {t("cookiePolicy.usedTitle")}
              </MDBTypography>
              <MDBTypography className="text-start mb-3">{t("cookiePolicy.usedIntro")}</MDBTypography>

              <MDBListGroup>
                <MDBListGroupItem>
                  <b>{"token"}</b>
                  {` - ${t("cookiePolicy.tokenDesc")}`}
                </MDBListGroupItem>
                <MDBListGroupItem>
                  <b>{"email"}</b>
                  {` - ${t("cookiePolicy.emailDesc")}`}
                </MDBListGroupItem>
                <MDBListGroupItem>
                  <b>{"role"}</b>
                  {` - ${t("cookiePolicy.roleDesc")}`}
                </MDBListGroupItem>
                <MDBListGroupItem>
                  <b>{"userName"}</b>
                  {` - ${t("cookiePolicy.userNameDesc")}`}
                </MDBListGroupItem>
                <MDBListGroupItem>
                  <b>{"rights"}</b>
                  {` - ${t("cookiePolicy.rightsDesc")}`}
                </MDBListGroupItem>
              </MDBListGroup>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        <MDBCol lg="4">
          <MDBCard className="h-100">
            <MDBCardBody className="d-flex flex-column">
              <MDBTypography tag="h5" className="mb-2 text-start">
                {t("cookiePolicy.consentTitle")}
              </MDBTypography>
              <MDBTypography className="text-start mb-3">
                {`${t("cookiePolicy.currentChoice")}: `}
                <b>{getCookieConsent() || t("cookiePolicy.notSelected")}</b>
                {"."}
              </MDBTypography>

              <div className="mt-auto d-flex flex-wrap gap-2">
                <MDBBtn color="secondary" type="button" onClick={() => clearCookieConsent()}>
                  {t("cookiePolicy.changeChoice")}
                </MDBBtn>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default CookiePolicyPage;
