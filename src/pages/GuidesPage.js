import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MDBContainer, MDBInput, MDBListGroup, MDBListGroupItem, MDBTypography } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

const GuidesPage = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const blocks = useMemo(
    () => [
      {
        id: "login",
        title: t("guides.blocks.login.title"),
        searchText: [t("guides.blocks.login.title"), t("guides.blocks.login.i1a"), t("guides.blocks.login.i1link"), t("guides.blocks.login.i2")].join(" "),
        items: [
          <>
            {`${t("guides.blocks.login.i1a")} `}
            <Link to="/login">{t("guides.blocks.login.i1link")}</Link>
            {` ${t("guides.blocks.login.i1b")}`}
          </>,
          t("guides.blocks.login.i2"),
        ],
      },
      {
        id: "edit",
        title: t("guides.blocks.edit.title"),
        searchText: [t("guides.blocks.edit.title"), t("guides.blocks.edit.i1"), t("guides.blocks.edit.i2"), t("guides.blocks.edit.i3a"), t("guides.blocks.edit.i3link")].join(" "),
        items: [
          t("guides.blocks.edit.i1"),
          t("guides.blocks.edit.i2"),
          <>
            {`${t("guides.blocks.edit.i3a")} `}
            <Link to="/registration">{t("guides.blocks.edit.i3link")}</Link>
            {` ${t("guides.blocks.edit.i3b")}`}
          </>,
        ],
      },
      {
        id: "menu",
        title: t("guides.blocks.menu.title"),
        searchText: [
          t("guides.blocks.menu.title"),
          t("guides.blocks.menu.i0"),
          t("guides.blocks.menu.i1"),
          t("guides.blocks.menu.i2"),
          t("guides.blocks.menu.i3"),
          t("guides.blocks.menu.i4"),
          t("guides.blocks.menu.i5"),
          t("guides.blocks.menu.screensTitle"),
          t("guides.blocks.menu.shotMobileCollapsed"),
          t("guides.blocks.menu.shotMobile"),
          t("guides.blocks.menu.shotTabletCollapsed"),
          t("guides.blocks.menu.shotTablet"),
          t("guides.blocks.menu.shotDesktop"),
        ].join(" "),
        items: [
          t("guides.blocks.menu.i0"),
          t("guides.blocks.menu.i1"),
          t("guides.blocks.menu.i2"),
          t("guides.blocks.menu.i3"),
          t("guides.blocks.menu.i4"),
          t("guides.blocks.menu.i5"),
        ],
        extra: (
          <div className="mt-3">
            <MDBTypography tag="h6" className="mb-2 text-start">
              {t("guides.blocks.menu.screensTitle")}
            </MDBTypography>
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-4">
                <figure className="m-0">
                  <img
                    src="/img/guides/menu-mobile-collapsed.png"
                    alt={t("guides.blocks.menu.shotMobileCollapsed")}
                    className="img-fluid rounded border"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="small text-muted mt-1 text-start">
                    {t("guides.blocks.menu.shotMobileCollapsed")}
                  </figcaption>
                </figure>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <figure className="m-0">
                  <img
                    src="/img/guides/menu-mobile.png"
                    alt={t("guides.blocks.menu.shotMobile")}
                    className="img-fluid rounded border"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="small text-muted mt-1 text-start">{t("guides.blocks.menu.shotMobile")}</figcaption>
                </figure>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <figure className="m-0">
                  <img
                    src="/img/guides/menu-tablet-collapsed.png"
                    alt={t("guides.blocks.menu.shotTabletCollapsed")}
                    className="img-fluid rounded border"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="small text-muted mt-1 text-start">
                    {t("guides.blocks.menu.shotTabletCollapsed")}
                  </figcaption>
                </figure>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <figure className="m-0">
                  <img
                    src="/img/guides/menu-tablet.png"
                    alt={t("guides.blocks.menu.shotTablet")}
                    className="img-fluid rounded border"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="small text-muted mt-1 text-start">{t("guides.blocks.menu.shotTablet")}</figcaption>
                </figure>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <figure className="m-0">
                  <img
                    src="/img/guides/menu-desktop.png"
                    alt={t("guides.blocks.menu.shotDesktop")}
                    className="img-fluid rounded border"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="small text-muted mt-1 text-start">{t("guides.blocks.menu.shotDesktop")}</figcaption>
                </figure>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "forgot",
        title: t("guides.blocks.forgot.title"),
        searchText: [t("guides.blocks.forgot.title"), t("guides.blocks.forgot.i1a"), t("guides.blocks.forgot.i1link"), t("guides.blocks.forgot.i2"), t("guides.blocks.forgot.i3")].join(" "),
        items: [
          <>
            {`${t("guides.blocks.forgot.i1a")} `}
            <Link to="/login">{t("guides.blocks.forgot.i1link")}</Link>
            {` ${t("guides.blocks.forgot.i1b")}`}
          </>,
          t("guides.blocks.forgot.i2"),
          t("guides.blocks.forgot.i3"),
        ],
      },
      {
        id: "reset",
        title: t("guides.blocks.reset.title"),
        searchText: [t("guides.blocks.reset.title"), t("guides.blocks.reset.i1"), t("guides.blocks.reset.i2"), t("guides.blocks.reset.i3a"), t("guides.blocks.reset.i3link")].join(" "),
        items: [
          t("guides.blocks.reset.i1"),
          t("guides.blocks.reset.i2"),
          <>
            {`${t("guides.blocks.reset.i3a")} `}
            <Link to="/login">{t("guides.blocks.reset.i3link")}</Link>
            {` ${t("guides.blocks.reset.i3b")}`}
          </>,
        ],
      },
      {
        id: "change",
        title: t("guides.blocks.change.title"),
        searchText: [t("guides.blocks.change.title"), t("guides.blocks.change.i1a"), t("guides.blocks.change.i1link")].join(" "),
        items: [
          <>
            {`${t("guides.blocks.change.i1a")} `}
            <Link to="/changepassword">{t("guides.blocks.change.i1link")}</Link>
            {t("guides.blocks.change.i1b")}
          </>,
        ],
      },
      {
        id: "issues",
        title: t("guides.blocks.issues.title"),
        searchText: [t("guides.blocks.issues.title"), t("guides.blocks.issues.i1"), t("guides.blocks.issues.i2"), t("guides.blocks.issues.i3")].join(" "),
        items: [t("guides.blocks.issues.i1"), t("guides.blocks.issues.i2"), t("guides.blocks.issues.i3")],
      },
    ],
    [t]
  );

  const visibleBlocks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blocks;

    return blocks.filter((block) => block.searchText.toLowerCase().includes(q));
  }, [blocks, query]);

  return (
    <MDBContainer className="my-5">
      <MDBTypography className="mb-4 text-start">
        {`${t("guides.intro")} `}
        <a href="mailto:poradatel@ppvcup.cz">poradatel@ppvcup.cz</a>
        {"."}
      </MDBTypography>

      <div className="mb-4">
        <MDBInput
          label={t("guides.searchLabel")}
          aria-label={t("guides.searchLabel")}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visibleBlocks.length === 0 ? (
        <MDBTypography className="text-start">
          {`${t("guides.noResultsPrefix")} `}
          <a href="mailto:poradatel@ppvcup.cz">poradatel@ppvcup.cz</a>
          {"."}
        </MDBTypography>
      ) : (
        visibleBlocks.map((block) => (
          <div key={block.id} className="mb-4">
            <MDBTypography tag="h5" className="mt-4 mb-2 text-start">
              {block.title}
            </MDBTypography>
            <MDBListGroup className="mb-2">
              {block.items.map((item, index) => (
                <MDBListGroupItem key={`${block.id}-${index}`}>{item}</MDBListGroupItem>
              ))}
            </MDBListGroup>
            {block.extra ? block.extra : null}
          </div>
        ))
      )}
    </MDBContainer>
  );
};

export default GuidesPage;
