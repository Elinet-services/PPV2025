//  export const apiBaseUrl = "https://script.google.com/macros/s/AKfycby7ANAR0E0geFDUp-Zi086Ie8KjFz7X5vcj1sQ4yIMg9yUDOPdd0LbyQYLqOs44aZxF/exec";
export const apiBaseUrl = "https://script.google.com/macros/s/AKfycbwS7CO_8-lzt3qeuHd7uF6UFYyjBjPrvJ9AeXpIoE_61tDaVvRYKOudB7EdR_tTXFX8/exec";
const cookieTimeout = 120;   //  platnost cookie v minutach
export const domainName = 'ppvcup2024';

export function getEmail () {
    return getCookie('email');
}
export function getToken() {
    return getCookie('token');
}

export function setCookies(responseData) {
    setCookie('token', responseData.loginToken);
    setCookie('email', responseData.email);
}
export function resetCookies() {
    console.log('resetCookies');
    deleteCookie('token');
    deleteCookie('email');
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
export default async function processRequest(formData, source, setLoading, setMessage, setError, submitAlertMessage)
{
    setLoading(true);
    let isError = false;
    let responseMessage = '';
    let adminData = {};

    formData.append("source", source);
    formData.append("token", getToken());

    /* for (const pair of formData.entries()) {
      console.log(pair[0] +', '+ pair[1]);
    } */

    await fetch(apiBaseUrl, {
        method: "POST",
        body: formData
    })
    .then((response) => {
        if (response.ok) {
            return response.json()
        } else {
            isError = true;
            return { message: "Požadavek se nepodařilo odeslat" }
        }
    })
    .then((responseData) => {
        console.log(responseData);
        isError         = responseData.isError;
        responseMessage = responseData.message;
        adminData       = responseData.adminData;
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
        submitAlertMessage.current.click();

    return {"isError": isError, "adminData": adminData };
}