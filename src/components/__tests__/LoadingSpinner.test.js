import React from "react";
import { render, screen } from "@testing-library/react";

import LoadingSpinner from "../LoadingSpinner";

jest.mock("mdb-react-ui-kit", () => ({
  MDBIcon: () => <i data-testid="spinner-icon" />,
  MDBLoadingManagement: () => <div data-testid="loading-management" />,
}));

test("renders visible localized label when provided", () => {
  render(<LoadingSpinner label="Wird geladen..." />);

  expect(screen.getByTestId("loading-management")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Wird geladen...");
});

test("does not render status label when label is empty", () => {
  render(<LoadingSpinner />);

  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

