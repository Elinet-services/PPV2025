import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "../../i18n";
import Actualities from "../Actualities";

jest.mock("../../services/connection", () => ({
  formatDate: jest.fn(() => "01.02.2026 12:00"),
}));

jest.mock("../../services/translation", () => ({
  normalizeLanguage: jest.fn((lang) => (lang || "en").toLowerCase().split("-")[0]),
  translateText: jest.fn(),
  translateHtml: jest.fn(),
}));

const { translateText, translateHtml } = require("../../services/translation");
const { normalizeLanguage } = require("../../services/translation");

const createNote = (overrides = {}) => ({
  rowNr: 1,
  date: "2026-02-01T12:00:00.000Z",
  header: "Original header",
  bodyText: encodeURIComponent("<p>Original body</p>"),
  ...overrides,
});

beforeEach(async () => {
  jest.clearAllMocks();
  normalizeLanguage.mockReturnValue("en");
  await i18n.changeLanguage("en");
});

test("translates an actuality on demand and toggles back to original", async () => {
  const user = userEvent.setup();
  translateText.mockResolvedValueOnce("Translated header");
  translateHtml.mockResolvedValueOnce("<p>Translated body</p>");

  render(<Actualities noteList={[createNote()]} />);

  expect(screen.getByText("Original header")).toBeInTheDocument();
  expect(screen.getByText("Original body")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Translate" }));

  await waitFor(() => expect(screen.getByText("Translated header")).toBeInTheDocument());
  expect(screen.getByText("Translated body")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Original" })).toBeInTheDocument();

  expect(translateText.mock.calls[0][0]).toBe("Original header");
  expect(translateHtml.mock.calls[0][0]).toBe("<p>Original body</p>");

  await user.click(screen.getByRole("button", { name: "Original" }));

  await waitFor(() => expect(screen.getByText("Original header")).toBeInTheDocument());
  expect(screen.getByText("Original body")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Translate" })).toBeInTheDocument();
});

test("shows translation error and keeps original content when translation fails", async () => {
  const user = userEvent.setup();
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  translateText.mockRejectedValueOnce(new Error("translate failed"));
  translateHtml.mockResolvedValueOnce("<p>unused</p>");

  render(<Actualities noteList={[createNote()]} />);

  await user.click(screen.getByRole("button", { name: "Translate" }));

  await waitFor(() => expect(screen.getByText("Translation failed.")).toBeInTheDocument());
  expect(screen.getByText("Original header")).toBeInTheDocument();
  expect(screen.getByText("Original body")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Translate" })).toBeInTheDocument();

  consoleErrorSpy.mockRestore();
});

test("renders only the latest actuality by default and shows all after tab switch", async () => {
  const user = userEvent.setup();
  render(
    <Actualities
      noteList={[
        createNote({
          rowNr: 1,
          date: "2026-02-01T10:00:00.000Z",
          header: "Older",
          bodyText: encodeURIComponent("<p>Older body</p>"),
        }),
        createNote({
          rowNr: 2,
          date: "2026-02-02T10:00:00.000Z",
          header: "Latest",
          bodyText: encodeURIComponent("<p>Latest body</p>"),
        }),
      ]}
    />
  );

  expect(screen.getByText("Latest")).toBeInTheDocument();
  expect(screen.queryByText("Older")).not.toBeInTheDocument();

  await user.click(screen.getByText("All updates"));

  expect(screen.getByText("Latest")).toBeInTheDocument();
  expect(screen.getByText("Older")).toBeInTheDocument();
});

test("hides translation button in Czech locale", async () => {
  normalizeLanguage.mockReturnValue("cs");
  await i18n.changeLanguage("cs");

  render(<Actualities noteList={[createNote()]} />);

  expect(screen.queryByRole("button", { name: /přeložit/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /translate/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/přeložit/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/translate/i)).not.toBeInTheDocument();
});
