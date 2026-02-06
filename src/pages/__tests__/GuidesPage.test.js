import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GuidesPage from "../GuidesPage";

jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  }),
  { virtual: true }
);

function renderGuides() {
  return render(<GuidesPage />);
}

test("search shows whole matching block", async () => {
  const user = userEvent.setup();
  renderGuides();

  expect(screen.getByRole("heading", { name: /^přihlášení$/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /^reset hesla \(nastavení nového hesla\)$/i })).toBeInTheDocument();

  await user.type(screen.getByLabelText(/vyhledat v nápovědě/i), "reset");

  expect(screen.queryByRole("heading", { name: /^přihlášení$/i })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /^reset hesla \(nastavení nového hesla\)$/i })).toBeInTheDocument();

  expect(screen.getByText(/Zadejte nové heslo/i)).toBeInTheDocument();
});

test("search shows not-found message", async () => {
  const user = userEvent.setup();
  renderGuides();

  await user.type(screen.getByLabelText(/vyhledat v nápovědě/i), "neexistuje");
  expect(screen.getByText(/Nic nenalezeno/i)).toBeInTheDocument();
});
