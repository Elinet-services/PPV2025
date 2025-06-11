//  export const apiBaseUrl = "https://script.google.com/macros/s/AKfycbxIIdGsEkv1xV4lpmz6PrvZHodiFNHmIk5sQHemJA5-OZTjVOHdqCKrAs06O6esF5Si/exec"                                                              
export const apiBaseUrl = "https://script.google.com/macros/s/AKfycbx4bwjD-4bBvQleKlV9tjasYEgA4rQF6rjaPsqmOoSUbv-0Vu3LKsYWGAIpYsczois/exec";
const cookieTimeout = 120;   //  platnost cookie v minutach
export const domainName = 'ppvcup2024';

export function getEmail () {
    return getCookie('email');
}
export function getToken() {
    return getCookie('token');
}
export function getOperatorLevel() {   //  N - none; U - User; A - Admin
    let operatorLevel = getCookie('role');
    if (operatorLevel.length === 0)
        operatorLevel = 'N';
    return operatorLevel;
}
export function getUserName () {
    return getCookie('userName');
}
export function getRights () {
    return getCookie('rights');
}

export function setCookies(responseData) {
    setCookie('token', responseData.loginToken);
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

function setCookie(aName, aValue) {
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + (cookieTimeout * 60 * 1000));
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

//  -------------------------------------------------------------------------------
export async function processRequest(formData, action, setLoading, setMessage, setError, showAlerMessage)
{
    setLoading(true);
    let isError = false;
    let responseMessage = '';
    let responseData = {};

    const updatedFormData = {
        ...formData,
        source: 'TEST',
        action: action,
        domain: domainName,
        token: getToken()
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