import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { sha256 } from "node-forge";

jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: jest.fn(),
  }),
  { virtual: true }
);

jest.mock("../../services/connection.js", () => ({
  processRequest: jest.fn(),
  setCookies: jest.fn(),
  resetCookies: jest.fn(),
}));

const { processRequest, setCookies, resetCookies } = require("../../services/connection.js");
const { useNavigate } = require("react-router-dom");

import Login from "../UserLogin";

function renderLogin(extraProps = {}) {
  const props = {
    setLoading: jest.fn(),
    setMessage: jest.fn(),
    setError: jest.fn(),
    showAlerMessage: jest.fn(),
    setUserRights: jest.fn(),
    ...extraProps,
  };

  return render(<Login {...props} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("login: hashes password and navigates on success", async () => {
  const navigateMock = jest.fn();
  useNavigate.mockReturnValue(navigateMock);

  processRequest.mockResolvedValueOnce({
    isError: false,
    responseData: { rights: "U", role: "U", loginToken: "t", email: "x", userName: "y" },
  });

  renderLogin();

  await userEvent.type(screen.getByLabelText("Email"), "  JIRI.JANDA@ELINET.CZ ");
  await userEvent.type(screen.getByLabelText("Heslo"), "tajneheslo");
  await userEvent.click(screen.getByRole("button", { name: "Přihlásit" }));

  const normalizedEmail = "jiri.janda@elinet.cz";
  const expectedHash = sha256.create().update(normalizedEmail + "tajneheslo").digest().toHex();

  await waitFor(() => {
    expect(resetCookies).toHaveBeenCalledTimes(1);
    expect(processRequest).toHaveBeenCalledTimes(1);
  });

  const [payload, action] = processRequest.mock.calls[0];
  expect(action).toBe("login");
  expect(payload.email).toBe(normalizedEmail);
  expect(payload.password).toBe(expectedHash);

  await waitFor(() => {
    expect(setCookies).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});

test("forgot password: sends normalized email and empty password", async () => {
  processRequest.mockResolvedValueOnce({ isError: false, responseData: {} });

  renderLogin();

  await userEvent.type(screen.getByLabelText("Email"), "Jiri.Janda@EliNet.cz");
  await userEvent.click(screen.getByRole("button", { name: "Zapomenuté heslo" }));
  await userEvent.click(screen.getByRole("button", { name: "Odeslat odkaz" }));

  await waitFor(() => expect(processRequest).toHaveBeenCalledTimes(1));
  const [payload, action] = processRequest.mock.calls[0];

  expect(action).toBe("forgotpassword");
  expect(payload.email).toBe("jiri.janda@elinet.cz");
  expect(payload.password).toBe("");
});
