import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { sha256 } from "node-forge";

jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
  }),
  { virtual: true }
);

jest.mock("../../services/connection.js", () => ({
  processRequest: jest.fn(),
}));

const { processRequest } = require("../../services/connection.js");
const { useNavigate, useLocation } = require("react-router-dom");

import ResetPassword from "../UserResetPassword";

beforeEach(() => {
  jest.clearAllMocks();
});

test("reset password: parses resetToken and hashes password with decoded salt", async () => {
  const user = userEvent.setup();
  const navigateMock = jest.fn();
  useNavigate.mockReturnValue(navigateMock);

  processRequest.mockResolvedValueOnce({ isError: false, responseData: {} });

  // resetToken = <token> + "g" + <hex-encoded salt>
  const token = "TOKEN123";
  const salt = "abc";
  const saltHex = "616263";
  const resetToken = `${token}g${saltHex}`;

  useLocation.mockReturnValue({ search: `?resetToken=${resetToken}` });

  render(
    <ResetPassword
      setLoading={jest.fn()}
      setMessage={jest.fn()}
      setError={jest.fn()}
      showAlerMessage={jest.fn()}
    />
  );

  await user.type(screen.getByLabelText(/heslo \(min 8 znaků\)/i), "noveheslo");
  await user.type(screen.getByLabelText(/heslo pro kontrolu/i), "noveheslo");
  await user.click(screen.getByRole("button", { name: /nastavit nové heslo/i }));

  const expectedHash = sha256.create().update(salt + "noveheslo").digest().toHex();

  await waitFor(() => expect(processRequest).toHaveBeenCalledTimes(1));
  const [payload, action] = processRequest.mock.calls[0];
  expect(action).toBe("resetpassword");
  expect(payload.token).toBe(token);
  expect(payload.password).toBe(expectedHash);

  await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/login"));
});
