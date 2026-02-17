import { clearLocalizedValidityOnInput, handleLocalizedValidityOnInvalid } from "../formValidation";

describe("formValidation helpers", () => {
  const t = (key) => {
    const dict = {
      "common.validation.required": "Required field",
      "common.validation.invalidEmail": "Invalid email",
    };
    return dict[key] || key;
  };

  test("sets localized required message for missing value", () => {
    const setCustomValidity = jest.fn();
    const event = {
      target: {
        tagName: "INPUT",
        type: "text",
        validity: { valueMissing: true, typeMismatch: false, customError: false },
        setCustomValidity,
      },
    };

    handleLocalizedValidityOnInvalid(event, t);

    expect(setCustomValidity).toHaveBeenCalledWith("Required field");
  });

  test("sets localized email message for invalid email", () => {
    const setCustomValidity = jest.fn();
    const event = {
      target: {
        tagName: "INPUT",
        type: "email",
        validity: { valueMissing: false, typeMismatch: true, customError: false },
        setCustomValidity,
      },
    };

    handleLocalizedValidityOnInvalid(event, t);

    expect(setCustomValidity).toHaveBeenCalledWith("Invalid email");
  });

  test("does not override existing custom validity error", () => {
    const setCustomValidity = jest.fn();
    const event = {
      target: {
        tagName: "INPUT",
        type: "password",
        validity: { valueMissing: false, typeMismatch: false, customError: true },
        setCustomValidity,
      },
    };

    handleLocalizedValidityOnInvalid(event, t);

    expect(setCustomValidity).not.toHaveBeenCalled();
  });

  test("clears custom validity on input", () => {
    const setCustomValidity = jest.fn();
    const event = {
      target: {
        tagName: "INPUT",
        setCustomValidity,
      },
    };

    clearLocalizedValidityOnInput(event);

    expect(setCustomValidity).toHaveBeenCalledWith("");
  });
});

