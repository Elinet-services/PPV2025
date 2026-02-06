export let apiBaseUrl = "https://script.google.com/macros/s/AKfycbzAtoHGIXbvooP54sjFZFTJ8hdKpQs_d0EoK2sfLCUGlfE--D60vK7DGa8WVVCd9iWw/exec";
export let apiBaseUrlGet = "https://script.google.com/macros/s/AKfycbwpF48CKmoeOtbkq5EU1drEilJ8yBx6u1DIV3DdSwYl3XtZrSlPLTMTnouzpbSv2zWGJg/exec";
export let domainName = "ppvcup2026";

export const source = document.location.hostname;

const cookieTokenTimeout = 120;
const cookieTimeout = 1200;

const fallbackMessages = {
  cs: {
    requestFailed: "Požadavek se nepodařilo odeslat",
    requestError: "Chyba při odesílání požadavku",
    criticalError: "Kritická chyba",
    unexpectedResponse: "Neočekávaná odpověď serveru",
  },
  en: {
    requestFailed: "Request could not be sent",
    requestError: "Error while sending request",
    criticalError: "Critical error",
    unexpectedResponse: "Unexpected server response",
  },
  de: {
    requestFailed: "Anfrage konnte nicht gesendet werden",
    requestError: "Fehler beim Senden der Anfrage",
    criticalError: "Kritischer Fehler",
    unexpectedResponse: "Unerwartete Serverantwort",
  },
  fr: {
    requestFailed: "La requête n'a pas pu être envoyée",
    requestError: "Erreur lors de l'envoi de la requête",
    criticalError: "Erreur critique",
    unexpectedResponse: "Réponse serveur inattendue",
  },
};

function getUiLanguage() {
  const lang = (typeof document !== "undefined" ? document.documentElement?.lang : "cs") || "cs";
  const normalized = lang.toLowerCase();
  if (["cs", "en", "de", "fr"].includes(normalized)) return normalized;
  return "cs";
}

function msg(key) {
  const lang = getUiLanguage();
  return fallbackMessages[lang]?.[key] || fallbackMessages.cs[key] || "";
}

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
  deleteCookie("token");
  deleteCookie("role");
  deleteCookie("userName");
  deleteCookie("rights");
}

function setCookie(aName, aValue, timeout = cookieTimeout) {
  const expireDate = new Date();
  expireDate.setTime(expireDate.getTime() + timeout * 60 * 1000);
  document.cookie = `${aName}=${aValue};expires=${expireDate.toUTCString()};path=/`;
}

function getCookie(aName) {
  const name = `${aName}=`;
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
  document.cookie = `${aName}=;expires=${expireDate.toUTCString()};path=/`;
}

export function formatDate(isoDate) {
  const locale = getUiLanguage();
  const normalizedLocale =
    locale === "en" ? "en-GB" : locale === "de" ? "de-DE" : locale === "fr" ? "fr-FR" : "cs-CZ";

  const parts = new Intl.DateTimeFormat(normalizedLocale, {
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
    setCookie("token", token, cookieTokenTimeout);
  }
}

export async function fetchData(action, params) {
  extendSession();
  try {
    const response = await fetch(apiBaseUrlGet + `?action=${action}&domain=${domainName}` + (params || ""));
    if (response.ok) {
      return response.json();
    }
    return { message: msg("requestFailed"), isError: true, responseData: {} };
  } catch {
    return { message: msg("requestError"), isError: true, responseData: {} };
  }
}

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
    token: formData.token || token || "",
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

      return { message: msg("requestFailed"), isError: true, responseData: {} };
    } catch (e) {
      console.log(e.message);
      return { message: `${msg("criticalError")}: ${e.message}`, isError: true, responseData: {} };
    }
  };

  const applyResponse = (data, logFailure = true) => {
    if (!data || typeof data !== "object") {
      isError = true;
      responseMessage = msg("unexpectedResponse");
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
    showAlerMessage(true);
  }

  return { isError, responseData };
}
