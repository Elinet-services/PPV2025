import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    return {
      Link: ({ to, children, ...props }) => (
        <a href={to} {...props}>
          {children}
        </a>
      ),
      Routes: ({ children }) => <>{children}</>,
      Route: ({ element }) => element || null,
      useNavigate: () => jest.fn(),
      useLocation: () => ({ search: "" }),
    };
  },
  { virtual: true }
);

import { AppContext } from "../../App";
import i18n from "../../i18n";
import UserRegistration from "../UserRegistration";

jest.mock("../../components/ClubTypeahead", () => {
  const React = require("react");
  return function MockClubTypeahead({ label, value, onChange }) {
    return (
      <input
        aria-label={label}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  };
});

jest.mock("react-phone-number-input", () => {
  const React = require("react");
  return function MockPhoneInput({ id, className, value, onChange }) {
    return (
      <input
        id={id}
        aria-label="Phone"
        className={className}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  };
});

jest.mock("../../services/connection.js", () => ({
  domainName: "ppv2026",
  getEmail: jest.fn(() => ""),
  getToken: jest.fn(() => ""),
  processRequest: jest.fn(),
}));

const { getToken, processRequest } = require("../../services/connection.js");

const createAppContextValue = () => ({
  loading: false,
  setLoading: jest.fn(),
  alertMessage: false,
  showAlerMessage: jest.fn(),
  error: false,
  setError: jest.fn(),
  userRights: [""],
  setUserRights: jest.fn(),
  setResponseMessage: jest.fn(),
  apiBaseUrlState: true,
  logout: jest.fn(),
  processRequest: jest.fn(),
});

function renderUserRegistration(extraProps = {}) {
  const props = {
    setLoading: jest.fn(),
    setMessage: jest.fn(),
    setError: jest.fn(),
    showAlerMessage: jest.fn(),
    ...extraProps,
  };

  const rendered = render(
    <AppContext.Provider value={createAppContextValue()}>
      <UserRegistration {...props} />
    </AppContext.Provider>
  );

  return { ...rendered, props };
}

beforeEach(async () => {
  jest.clearAllMocks();
  getToken.mockReturnValue("");
  await i18n.changeLanguage("en");
});

test("shows required phone error on submit when phone is empty", async () => {
  const { container } = renderUserRegistration();

  // Keep submit synthetic event here to bypass browser required-field gate.
  fireEvent.submit(container.querySelector("form"));

  expect(await screen.findByText("Phone number is required.")).toBeInTheDocument();
  expect(processRequest).not.toHaveBeenCalled();
});

test("shows invalid phone error for malformed UK number", async () => {
  const user = userEvent.setup();
  const { container } = renderUserRegistration();

  await user.type(screen.getByLabelText("Phone"), "+44 45678978");
  fireEvent.submit(container.querySelector("form"));

  expect(await screen.findByText("Enter a valid phone number.")).toBeInTheDocument();
  expect(processRequest).not.toHaveBeenCalled();
});

test("submits valid UK phone and sends normalized value", async () => {
  const user = userEvent.setup();
  processRequest.mockResolvedValueOnce({ isError: false, responseData: {} });
  const { container } = renderUserRegistration();

  await user.type(screen.getByLabelText("Phone"), "+44 7912 345678");
  fireEvent.submit(container.querySelector("form"));

  await waitFor(() => expect(processRequest).toHaveBeenCalledTimes(1));

  const [payload, action] = processRequest.mock.calls[0];
  expect(action).toBe("registration");
  expect(payload.phone).toBe("+447912345678");
  expect(screen.queryByText("Enter a valid phone number.")).not.toBeInTheDocument();
});

test("submits possible UK phone and sends normalized value", async () => {
  const user = userEvent.setup();
  processRequest.mockResolvedValueOnce({ isError: false, responseData: {} });
  const { container } = renderUserRegistration();

  await user.type(screen.getByLabelText("Phone"), "+44 7700 900321");
  fireEvent.submit(container.querySelector("form"));

  await waitFor(() => expect(processRequest).toHaveBeenCalledTimes(1));

  const [payload, action] = processRequest.mock.calls[0];
  expect(action).toBe("registration");
  expect(payload.phone).toBe("+447700900321");
  expect(screen.queryByText("Enter a valid phone number.")).not.toBeInTheDocument();
});
