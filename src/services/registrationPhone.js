import { getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";

export const DEFAULT_PHONE_COUNTRY = "CZ";

export const normalizePhoneCountryPrefix = (phoneValue) => {
  if (!phoneValue) return "";
  return String(phoneValue).trim().replace(/^\+0+/, "+");
};

export const replacePhoneCountryCode = (phoneValue, previousCountry, nextCountry) => {
  const normalizedValue = normalizePhoneCountryPrefix(phoneValue);
  const nextCallingCode = getCountryCallingCode(nextCountry);
  if (!normalizedValue) return `+${nextCallingCode}`;

  const digits = normalizedValue.replace(/[^\d]/g, "");
  if (!digits) return `+${nextCallingCode}`;

  const previousCallingCode = previousCountry ? getCountryCallingCode(previousCountry) : "";
  const nationalDigits = previousCallingCode && digits.startsWith(previousCallingCode)
    ? digits.slice(previousCallingCode.length)
    : digits;

  return `+${nextCallingCode}${nationalDigits}`;
};

export const detectPhoneCountry = (phoneValue, fallbackCountry = DEFAULT_PHONE_COUNTRY) => {
  if (!phoneValue) return fallbackCountry;
  const normalizedValue = normalizePhoneCountryPrefix(phoneValue);
  const parsed = parsePhoneNumberFromString(normalizedValue);
  return parsed?.country || fallbackCountry;
};

export const validateRegistrationPhone = (phoneValue, fallbackCountry = DEFAULT_PHONE_COUNTRY) => {
  const normalizedPhone = normalizePhoneCountryPrefix(phoneValue);
  if (!normalizedPhone) {
    return {
      isValid: false,
      errorKey: "registration.phoneRequired",
      normalizedPhone,
    };
  }

  const parsed = parsePhoneNumberFromString(normalizedPhone, fallbackCountry);
  if (!parsed || !parsed.isValid()) {
    return {
      isValid: false,
      errorKey: "registration.invalidPhone",
      normalizedPhone,
    };
  }

  return {
    isValid: true,
    errorKey: "",
    normalizedPhone: parsed.number,
  };
};
