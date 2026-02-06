import {
  DEFAULT_PHONE_COUNTRY,
  detectPhoneCountry,
  normalizePhoneCountryPrefix,
  replacePhoneCountryCode,
  validateRegistrationPhone,
} from "../registrationPhone";

describe("registrationPhone helpers", () => {
  test("normalizePhoneCountryPrefix: trims value and fixes +00 prefix", () => {
    expect(normalizePhoneCountryPrefix("  +00420777123456  ")).toBe("+420777123456");
  });

  test("validateRegistrationPhone: requires phone value", () => {
    const result = validateRegistrationPhone("", DEFAULT_PHONE_COUNTRY);

    expect(result).toEqual({
      isValid: false,
      errorKey: "registration.phoneRequired",
      normalizedPhone: "",
    });
  });

  test("validateRegistrationPhone: accepts valid international number", () => {
    const result = validateRegistrationPhone("+420777123456", DEFAULT_PHONE_COUNTRY);

    expect(result).toEqual({
      isValid: true,
      errorKey: "",
      normalizedPhone: "+420777123456",
    });
  });

  test("validateRegistrationPhone: accepts local number for fallback country", () => {
    const result = validateRegistrationPhone("777123456", "CZ");

    expect(result).toEqual({
      isValid: true,
      errorKey: "",
      normalizedPhone: "+420777123456",
    });
  });

  test("validateRegistrationPhone: accepts formatted number with spaces", () => {
    const result = validateRegistrationPhone("+420 777 123 456", DEFAULT_PHONE_COUNTRY);

    expect(result).toEqual({
      isValid: true,
      errorKey: "",
      normalizedPhone: "+420777123456",
    });
  });

  test("validateRegistrationPhone: rejects too short number", () => {
    const result = validateRegistrationPhone("+42012", DEFAULT_PHONE_COUNTRY);

    expect(result).toEqual({
      isValid: false,
      errorKey: "registration.invalidPhone",
      normalizedPhone: "+42012",
    });
  });

  test("validateRegistrationPhone: rejects malformed UK number", () => {
    const result = validateRegistrationPhone("+44 45678978", "GB");

    expect(result).toEqual({
      isValid: false,
      errorKey: "registration.invalidPhone",
      normalizedPhone: "+44 45678978",
    });
  });

  test("validateRegistrationPhone: accepts valid UK number", () => {
    const result = validateRegistrationPhone("+44 7912 345678", "GB");

    expect(result).toEqual({
      isValid: true,
      errorKey: "",
      normalizedPhone: "+447912345678",
    });
  });

  test("detectPhoneCountry: detects country from valid international value", () => {
    expect(detectPhoneCountry("+4915123456789", DEFAULT_PHONE_COUNTRY)).toBe("DE");
  });

  test("detectPhoneCountry: returns fallback for empty value", () => {
    expect(detectPhoneCountry("", DEFAULT_PHONE_COUNTRY)).toBe("CZ");
  });

  test("replacePhoneCountryCode: replaces country prefix and keeps national digits", () => {
    expect(replacePhoneCountryCode("+420777123456", "CZ", "SK")).toBe("+421777123456");
  });
});
