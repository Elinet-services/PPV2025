export let apiBaseUrl = "https://script.google.com/macros/s/AKfycbzD4_eaZd8XHjDXQEa9QCEwNfATQMLFfjIXsMEJNxCi4scW9WihVlp7Nfgla9MVTJRy/exec";
export let apiBaseUrlGet = "https://script.google.com/macros/s/AKfycbzTOeppmYl4PS91Ue3ymfHcJHEYJh_1SGA1BHHS5lpW42VkR6JpM30YIpGRlDCvZR0b9A/exec";
export let domainName = 'ppvcup2026';
export const source = document.location.hostname;  //  pro testovani localhost, pro produkci ppvcup.cz
const cookieTokenTimeout = 120;     //  platnost tokenu v minutach
const cookieTimeout = 1200;         //  platnost ostatnich cookies v minutach

export function setDomainName(aDomainName) {
    domainName = aDomainName;
}
export function setApiBaseUrl(aApiBaseUrl) {
    apiBaseUrl = aApiBaseUrl;
}
export function setApiBaseUrlGet(aApiBaseUrl) {
    apiBaseUrlGet = aApiBaseUrl;
}

export function getEmail () {
    return getCookie('email').toLowerCase();
}
export function getToken() {
    return getCookie('token');
}
/* export function getOperatorLevel() {   //  N - none; U - User; A - Admin
    let operatorLevel = getCookie('role');
    if (operatorLevel.length === 0)
        operatorLevel = 'N';
    return operatorLevel;
}*/
export function getUserName () {
    return getCookie('userName');
}
export function getRights () {
    return getCookie('rights');
}

export function setCookies(responseData) {
    setCookie('token', responseData.loginToken, cookieTokenTimeout);
    setCookie('email', responseData.email);
    setCookie('role', responseData.role);
    setCookie('userName', responseData.userName);
    setCookie('rights', responseData.rights);
}
export function resetCookies() {
    console.log('resetCookies');
    deleteCookie('token');
    deleteCookie('role');
    deleteCookie('userName');
    deleteCookie('rights');
}

function setCookie(aName, aValue, timeout = cookieTimeout) {
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + (timeout * 60 * 1000));
    document.cookie = aName +"="+ aValue +";expires="+ expireDate.toUTCString() +";path=/";
}

function getCookie(aName)
{
    const name = aName +"=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

function deleteCookie(aName)
{
    const expireDate = new Date(0);
    document.cookie = aName +"=;expires="+ expireDate.toUTCString() +";path=/";
}

//  -------------------------------------------------------------------------------
//  preformatuje datum z DB k zobrazeni v prehledu
export function formatDate(aDate, aDocumentType) {
    let dateString = '';
    if (aDocumentType === 'D' && aDate != null) {
        const firstDot = aDate.indexOf('-');
        const lastDot  = aDate.lastIndexOf('-');
        //  kontrola
        if (firstDot > 0 && lastDot > firstDot )
        dateString = parseInt(aDate.substring(lastDot + 1)) +'.'+ parseInt(aDate.substring(firstDot + 1, lastDot)) +'.'+ aDate.substring(0, firstDot);
    }
    return dateString;
}
function extendSession() {
    const token = getToken();
    if (token.length != 0) {
        setCookie('token', token, cookieTokenTimeout);  //  obnoveni platnosti cookie tokenu
    }
}

//  -------------------------------------------------------------------------------
//  zavola GET do DB
export async function fetchData(action, params)
{
    extendSession();
    try {
        let response = await fetch((action ==='racerlist' ? apiBaseUrlGet : apiBaseUrl)
            + `?action=${action}&domain=${domainName}`+ params)
        if (response.ok) {
            return response.json()
        } else {
            return { message: "Požadavek se nepodařilo odeslat", isError: true }
        }
    } catch (e) {
        return { message: "Chyba při odesílání požadavku", isError: true }
    }
}

//  -------------------------------------------------------------------------------
export async function processRequest(formData, action, setLoading, setMessage, setError, showAlerMessage)
{
    setLoading(true);
    let isError = false;
    let responseMessage = '';
    let responseData = {};
    const token = getToken();
    extendSession();
    
    const updatedFormData = {
        ...formData,
        source: source,
        action: action,
        domain: domainName,
        token: formData.token || token || '',  //  pokud neni token v datech, pouzijeme token z cookies
    };

    /* for (const pair of formData.entries()) {
      console.log(pair[0] +', '+ pair[1]);
    } */

    await fetch(apiBaseUrl, {
        method: "POST",
        body: JSON.stringify(updatedFormData)
    })
    .then((response) => {
        if (response.ok) {
            return response.json()
        } else {
            return { message: "Požadavek se nepodařilo odeslat", isError: true }
        }
    })
    .then((data) => {
        console.log(data);
        isError         = data.isError;
        responseMessage = data.message;
        responseData    = data.responseData;
    })
    .catch((e) => {
        console.log(e.message)
        isError = true;
        responseMessage = "Kritická chyba: "+ e.message;
     })
    setMessage(responseMessage);
    setError(isError);
    setLoading(false);
    if (responseMessage.length > 0)  //  zobrazit vysledek volani DB - responseMessage
        showAlerMessage(true);

    return {"isError": isError, "responseData": responseData };
}