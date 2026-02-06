export let apiBaseUrl = "https://script.google.com/macros/s/AKfycbzAtoHGIXbvooP54sjFZFTJ8hdKpQs_d0EoK2sfLCUGlfE--D60vK7DGa8WVVCd9iWw/exec";
export let apiBaseUrlGet = "https://script.google.com/macros/s/AKfycbwpF48CKmoeOtbkq5EU1drEilJ8yBx6u1DIV3DdSwYl3XtZrSlPLTMTnouzpbSv2zWGJg/exec";
export let domainName = "ppvcup2026";
export const source = document.location.hostname; // pro testovani localhost, pro produkci ppvcup.cz
const cookieTokenTimeout = 120; // platnost tokenu v minutach
const cookieTimeout = 1200; // platnost ostatnich cookies v minutach

export function setDomainName(aDomainName) {
  domainName = aDomainName;
}
export function setApiBaseUrl(aApiBaseUrl) {
  apiBaseUrl = aApiBaseUrl;
}
export function setApiBaseUrlGet(aApiBaseUrl) {
  apiBaseUrlGet = aApiBaseUrl;
}

export function getEmail() {
  return getCookie("email").toLowerCase();
}
export function getToken() {
  return getCookie("token");
}
/* export function getOperatorLevel() {   //  N - none; U - User; A - Admin
    let operatorLevel = getCookie('role');
    if (operatorLevel.length === 0)
        operatorLevel = 'N';
    return operatorLevel;
}*/
export function getUserName() {
  return getCookie("userName");
}
export function getRights() {
  return getCookie("rights");
}

export function setCookies(responseData) {
  setCookie("token", responseData.loginToken, cookieTokenTimeout);
  setCookie("email", responseData.email);
  setCookie("role", responseData.role);
  setCookie("userName", responseData.userName);
  setCookie("rights", responseData.rights);
}
export function resetCookies() {
  console.log("resetCookies");
  deleteCookie("token");
  deleteCookie("role");
  deleteCookie("userName");
  deleteCookie("rights");
}

function setCookie(aName, aValue, timeout = cookieTimeout) {
  const expireDate = new Date();
  expireDate.setTime(expireDate.getTime() + timeout * 60 * 1000);
  document.cookie = aName + "=" + aValue + ";expires=" + expireDate.toUTCString() + ";path=/";
}

function getCookie(aName) {
  const name = aName + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
}

function deleteCookie(aName) {
  const expireDate = new Date(0);
  document.cookie = aName + "=;expires=" + expireDate.toUTCString() + ";path=/";
}

//  -------------------------------------------------------------------------------
//  preformatuje datum z ISO k zobrazeni v prehledu
export function formatDate(isoDate) {
  const parts = new Intl.DateTimeFormat("cs-CZ", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(isoDate));

  const get = (type) => parts.find((p) => p.type === type)?.value;

  return `${get("day")}.${get("month")}.${get("year")} ${get("hour")}:${get("minute")}`;
}

function extendSession() {
  const token = getToken();
  if (token.length !== 0) {
    setCookie("token", token, cookieTokenTimeout); // obnoveni platnosti cookie tokenu
  }
}

//  -------------------------------------------------------------------------------
//  zavola GET do DB
export async function fetchData(action, params) {
  extendSession();
  try {
    const response = await fetch(apiBaseUrlGet + `?action=${action}&domain=${domainName}` + (params || ""));
    if (response.ok) {
      return response.json();
    }
    return { message: "PoĹľadavek se nepodaĹ™ilo odeslat", isError: true, responseData: {} };
  } catch (e) {
    return { message: "Chyba pĹ™i odesĂ­lĂˇnĂ­ poĹľadavku", isError: true, responseData: {} };
  }
}

//  -------------------------------------------------------------------------------
export async function processRequest(formData, action, setLoading, setMessage, setError, showAlerMessage) {
  setLoading(true);
  let isError = false;
  let responseMessage = "";
  let responseData = {};
  const token = getToken();
  extendSession();

  const updatedFormData = {
    ...formData,
    source,
    action,
    domain: domainName,
    token: formData.token || token || "", // pokud neni token v datech, pouzijeme token z cookies
  };

  const executePostRequest = async (url) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(updatedFormData),
      });

      if (response.ok) {
        return await response.json();
      }

      return { message: "PoĹľadavek se nepodaĹ™ilo odeslat", isError: true, responseData: {} };
    } catch (e) {
      console.log(e.message);
      return { message: "KritickĂˇ chyba: " + e.message, isError: true, responseData: {} };
    }
  };

  const applyResponse = (data, logFailure = true) => {
    if (!data || typeof data !== "object") {
      isError = true;
      responseMessage = "NeoÄŤekĂˇvanĂˇ odpovÄ›ÄŹ serveru";
      responseData = {};
      return;
    }

    isError = Boolean(data.isError);
    responseMessage = data.message || "";
    responseData = data.responseData || {};

    if (isError && logFailure) {
      console.warn(`Request "${action}" failed`, data);
    }
  };

  const response = await executePostRequest(apiBaseUrl);
  applyResponse(response);

  setMessage(responseMessage);
  setError(isError);
  setLoading(false);
  if (responseMessage.length > 0) {
    // zobrazit vysledek volani DB - responseMessage
    showAlerMessage(true);
  }

  return { isError, responseData };
}
