import {
  fetchData,
  normalizeUiLanguage,
  processRequest,
  setApiBaseUrl,
  setApiBaseUrlGet,
  setDomainName,
} from "../connection";

describe("connection localization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = "";
    document.documentElement.lang = "cs";
    localStorage.removeItem("ppv_lang");
    setApiBaseUrl("https://example.com/post");
    setApiBaseUrlGet("https://example.com/get");
    setDomainName("ppv");
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  test("normalizeUiLanguage supports locale variants", () => {
    expect(normalizeUiLanguage("en-US")).toBe("en");
    expect(normalizeUiLanguage("de-DE")).toBe("de");
    expect(normalizeUiLanguage("fr")).toBe("fr");
    expect(normalizeUiLanguage("es-ES")).toBe("");
    expect(normalizeUiLanguage("")).toBe("");
  });

  test("fetchData keeps legacy query format and returns localized fallback message", async () => {
    document.documentElement.lang = "en-US";
    global.fetch.mockResolvedValueOnce({ ok: false });

    const result = await fetchData("notes");

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/get?action=notes&domain=ppv");
    expect(result).toEqual({
      isError: true,
      message: "Request could not be sent",
      responseData: {},
    });
  });

  test("fetchData falls back to stored language when html lang is missing", async () => {
    document.documentElement.lang = "";
    localStorage.setItem("ppv_lang", "de-DE");
    global.fetch.mockResolvedValueOnce({ ok: false });

    const result = await fetchData("notes");

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/get?action=notes&domain=ppv");
    expect(result.message).toBe("Anfrage konnte nicht gesendet werden");
  });

  test("processRequest keeps legacy payload without language field", async () => {
    document.documentElement.lang = "fr-FR";
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isError: false, message: "OK", responseData: { ok: true } }),
    });

    const setLoading = jest.fn();
    const setMessage = jest.fn();
    const setError = jest.fn();
    const showAlerMessage = jest.fn();

    await processRequest({}, "login", setLoading, setMessage, setError, showAlerMessage);

    const [, options] = global.fetch.mock.calls[0];
    const payload = JSON.parse(options.body);

    expect(payload).not.toHaveProperty("language");
  });

  test("processRequest localizes known backend error code", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    document.documentElement.lang = "en-US";
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isError: true, message: "CRITICAL_ERROR", responseData: {} }),
    });

    const setLoading = jest.fn();
    const setMessage = jest.fn();
    const setError = jest.fn();
    const showAlerMessage = jest.fn();

    await processRequest({}, "forgotpassword", setLoading, setMessage, setError, showAlerMessage);

    expect(setMessage).toHaveBeenCalledWith("Critical error");
    expect(setError).toHaveBeenCalledWith(true);
    expect(showAlerMessage).toHaveBeenCalledWith(true);
    warnSpy.mockRestore();
  });

  test("processRequest localizes forgotpassword success message by active locale", async () => {
    document.documentElement.lang = "de-DE";
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        isError: false,
        message: "Žádost o reset hesla přijata. Zkontrolujte prosím Váš email a dokončete změnu hesla.",
        responseData: {},
      }),
    });

    const setLoading = jest.fn();
    const setMessage = jest.fn();
    const setError = jest.fn();
    const showAlerMessage = jest.fn();

    await processRequest({}, "forgotpassword", setLoading, setMessage, setError, showAlerMessage);

    expect(setMessage).toHaveBeenCalledWith(
      "Anfrage zum Zurücksetzen des Passworts wurde angenommen. Bitte prüfen Sie Ihre E-Mails und schließen Sie die Passwortänderung ab."
    );
    expect(setError).toHaveBeenCalledWith(false);
    expect(showAlerMessage).toHaveBeenCalledWith(true);
  });

  test("all confirmation actions are localized in all supported locales", async () => {
    const confirmationsByLocale = {
      cs: {
        login: "Uživatel byl přihlášen.",
        registration: "Registrace byla úspěšně uložena.",
        edit: "Údaje přihlášky byly úspěšně upraveny.",
        forgotpassword: "Žádost o reset hesla přijata. Zkontrolujte prosím Váš email a dokončete změnu hesla.",
        resetpassword: "Heslo bylo úspěšně nastaveno.",
        changepassword: "Heslo bylo úspěšně změněno.",
        registrationsubmit: "Přihláška byla úspěšně potvrzena.",
        logout: "Byli jste úspěšně odhlášeni.",
        savenote: "Aktualita byla úspěšně uložena.",
      },
      en: {
        login: "User signed in successfully.",
        registration: "Registration was saved successfully.",
        edit: "Entry details were updated successfully.",
        forgotpassword: "Password reset request accepted. Please check your email and complete the password change.",
        resetpassword: "Password was set successfully.",
        changepassword: "Password was changed successfully.",
        registrationsubmit: "Entry was confirmed successfully.",
        logout: "You have been signed out successfully.",
        savenote: "Update was saved successfully.",
      },
      de: {
        login: "Der Benutzer wurde erfolgreich angemeldet.",
        registration: "Die Registrierung wurde erfolgreich gespeichert.",
        edit: "Die Anmeldedaten wurden erfolgreich aktualisiert.",
        forgotpassword:
          "Anfrage zum Zurücksetzen des Passworts wurde angenommen. Bitte prüfen Sie Ihre E-Mails und schließen Sie die Passwortänderung ab.",
        resetpassword: "Das Passwort wurde erfolgreich gesetzt.",
        changepassword: "Das Passwort wurde erfolgreich geändert.",
        registrationsubmit: "Die Anmeldung wurde erfolgreich bestätigt.",
        logout: "Sie wurden erfolgreich abgemeldet.",
        savenote: "Die Aktualität wurde erfolgreich gespeichert.",
      },
      fr: {
        login: "L'utilisateur a été connecté avec succès.",
        registration: "L'inscription a été enregistrée avec succès.",
        edit: "Les données d'inscription ont été mises à jour avec succès.",
        forgotpassword:
          "La demande de réinitialisation du mot de passe a été acceptée. Veuillez vérifier votre e-mail et terminer la modification du mot de passe.",
        resetpassword: "Le mot de passe a été défini avec succès.",
        changepassword: "Le mot de passe a été modifié avec succès.",
        registrationsubmit: "L'inscription a été confirmée avec succès.",
        logout: "Vous avez été déconnecté avec succès.",
        savenote: "L'actualité a été enregistrée avec succès.",
      },
    };

    for (const [locale, actionMessages] of Object.entries(confirmationsByLocale)) {
      document.documentElement.lang = locale;

      for (const [action, expectedMessage] of Object.entries(actionMessages)) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ isError: false, message: "RAW_BACKEND_MESSAGE", responseData: {} }),
        });

        const setLoading = jest.fn();
        const setMessage = jest.fn();
        const setError = jest.fn();
        const showAlerMessage = jest.fn();

        await processRequest({}, action, setLoading, setMessage, setError, showAlerMessage);

        expect(setMessage).toHaveBeenCalledWith(expectedMessage);
        expect(setError).toHaveBeenCalledWith(false);
        expect(showAlerMessage).toHaveBeenCalledWith(true);
      }
    }
  });
});
