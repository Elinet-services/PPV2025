import { useMemo, useState } from "react";
import { MDBDatatable, MDBInput, MDBTabs, MDBTabsItem, MDBTabsLink, MDBContainer } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";
import { sortRacersByPaymentAndOrder, toSortableIsoDate } from "../services/racerListSorting";

import "./RacerList.css";

const DEFAULT_SORT_FIELD = "index";
const DEFAULT_SORT_ORDER = "asc";

const RacerList = ({ racerList, loading = false }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredBase = useMemo(() => {
    if (!racerList) return [];

    const q = searchQuery.trim().toLowerCase();

    return racerList
      .filter((r) => r?.name && r?.surname)
      .filter((r) => {
        if (!q) return true;
        return Object.values(r).some((v) => v?.toString().toLowerCase().includes(q));
      })
      .filter((r) => {
        const hasPayment = Boolean(toSortableIsoDate(r?.paymentDate));
        switch (activeTab) {
          case "club":
            return hasPayment && r.gliderClass === "club";
          case "combi":
            return hasPayment && r.gliderClass === "combi";
          default:
            return true;
        }
      });
  }, [racerList, searchQuery, activeTab]);

  const sortedRacers = useMemo(() => sortRacersByPaymentAndOrder(filteredBase), [filteredBase]);

  const datatableData = useMemo(() => {
    const columns = [
      { label: t("racerList.colNumber"), field: "index", sort: true },
      { label: t("racerList.colName"), field: "name", sort: false },
      { label: t("racerList.colSurname"), field: "surname", sort: true },
      { label: t("racerList.colClub"), field: "club", sort: true },
      { label: t("racerList.colGlider"), field: "glider", sort: true },
      { label: t("racerList.colImatriculation"), field: "imatriculation", sort: false },
      { label: t("racerList.colStartCode"), field: "startCode", sort: true },
      { label: t("racerList.colClass"), field: "gliderClass", sort: true, columnSelector: "glider-class-cell" },
      { label: t("racerList.colPaymentDate"), field: "paymentDate", sort: true },
    ];

    const rows = sortedRacers.map((r, idx) => {
      const iso = r.paymentDate ? toSortableIsoDate(r.paymentDate) : "";

      return {
        index: idx + 1,
        name: r.name ?? "",
        surname: r.surname ?? "",
        club: r.club ?? "",
        glider: r.glider ?? "",
        imatriculation: r.imatriculation ?? "",
        startCode: r.startCode ?? "-",
        gliderClass: r.gliderClass ?? "-",
        paymentDate: iso || "-",
      };
    });

    return { columns, rows };
  }, [sortedRacers, t]);

  const format = (field, value) => {
    if (field !== "gliderClass") return undefined;

    const v = String(value || "").toLowerCase();
    const isClub = v === "club";
    const isCombi = v === "combi";

    return {
      "--glider-badge-label": `"${v}"`,
      "--glider-badge-bg": isClub ? "#198754" : isCombi ? "#0d6efd" : "#6c757d",
      textAlign: "center",
      verticalAlign: "middle",
      color: "transparent",
    };
  };

  return (
    <MDBContainer className="my-5">
      <MDBInput className="mb-3" label={t("racerList.search")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

      <MDBTabs pills fill className="mb-4">
        <MDBTabsItem>
          <MDBTabsLink onClick={() => setActiveTab("all")} active={activeTab === "all"}>
            {t("racerList.tabAll")}
          </MDBTabsLink>
        </MDBTabsItem>

        <MDBTabsItem>
          <MDBTabsLink onClick={() => setActiveTab("club")} active={activeTab === "club"}>
            {t("racerList.tabClub")}
          </MDBTabsLink>
        </MDBTabsItem>

        <MDBTabsItem>
          <MDBTabsLink onClick={() => setActiveTab("combi")} active={activeTab === "combi"}>
            {t("racerList.tabCombi")}
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>

      <div className="racer-datatable">
        <MDBDatatable
          data={datatableData}
          bordered
          striped
          hover
          sm
          pagination
          entries={100}
          entriesOptions={[50, 100, 200]}
          isLoading={loading}
          loaderClass="bg-primary"
          loadingMessage={t("racerList.loading")}
          noFoundMessage={t("racerList.noResults")}
          rowsText={t("racerList.rowsText")}
          allText={t("racerList.allText")}
          ofText={t("racerList.ofText")}
          sortField={DEFAULT_SORT_FIELD}
          sortOrder={DEFAULT_SORT_ORDER}
          format={format}
        />
      </div>
    </MDBContainer>
  );
};

export default RacerList;
