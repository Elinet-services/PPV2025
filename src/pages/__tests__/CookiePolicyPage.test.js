import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CookiePolicyPage from "../CookiePolicyPage";

jest.mock("../../components/CookieConsent", () => ({
  clearCookieConsent: jest.fn(),
  getCookieConsent: jest.fn(() => "necessary"),
}));

const { clearCookieConsent } = require("../../components/CookieConsent");

test("renders cookie policy summary, cookie list, and consent change button", async () => {
  render(<CookiePolicyPage />);

  expect(screen.getByRole("heading", { name: "Cookies" })).toBeInTheDocument();
  expect(screen.getByText(/Tento web používá nezbytné cookies/i)).toBeInTheDocument();

  expect(screen.getByText("token")).toBeInTheDocument();
  expect(screen.getByText("email")).toBeInTheDocument();
  expect(screen.getByText("role")).toBeInTheDocument();
  expect(screen.getByText("userName")).toBeInTheDocument();
  expect(screen.getByText("rights")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Změnit volbu cookies" }));
  expect(clearCookieConsent).toHaveBeenCalledTimes(1);
});