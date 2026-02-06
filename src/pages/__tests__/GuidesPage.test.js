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
  renderGuides();

  expect(screen.getByRole("heading", { name: "Přihlášení" })).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Reset hesla (nastavení nového hesla)" })
  ).toBeInTheDocument();

  await userEvent.type(screen.getByLabelText("Vyhledat v nápovědě"), "reset");

  expect(
    screen.queryByRole("heading", { name: "Přihlášení" })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Reset hesla (nastavení nového hesla)" })
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      "Zadejte nové heslo (min. 8 znaků) a potvrďte ho ve druhém poli."
    )
  ).toBeInTheDocument();
});

test("search shows not-found message", async () => {
  renderGuides();

  await userEvent.type(screen.getByLabelText("Vyhledat v nápovědě"), "neexistuje");
  expect(screen.getByText(/Nic nenalezeno/)).toBeInTheDocument();
});