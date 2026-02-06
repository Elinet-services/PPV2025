const GENERIC_FIELD_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isFormField(target) {
  const tagName = String(target?.tagName || "").toUpperCase();
  return GENERIC_FIELD_TAGS.has(tagName);
}

export function handleLocalizedValidityOnInvalid(event, t) {
  const field = event?.target;
  if (!isFormField(field) || !field?.validity) return;

  if (field.validity.valueMissing) {
    field.setCustomValidity(t("common.validation.required"));
    return;
  }

  if (field.validity.typeMismatch && String(field.type || "").toLowerCase() === "email" && !field.validity.customError) {
    field.setCustomValidity(t("common.validation.invalidEmail"));
  }
}

export function clearLocalizedValidityOnInput(event) {
  const field = event?.target;
  if (!isFormField(field)) return;
  field.setCustomValidity("");
}

