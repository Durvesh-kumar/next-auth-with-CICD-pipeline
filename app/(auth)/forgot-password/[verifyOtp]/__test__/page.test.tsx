import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Page from "../page";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

// Mocking next/navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mocking react-hot-toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("Forgot Password OTP Verification Page", () => {
  const mockPush = jest.fn();
  const mockParams = { verifyOtp: encodeURIComponent("test@example.com") };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue(mockParams);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the OTP form correctly", () => {
    render(<Page />);

    // Check if the heading is rendered
    expect(screen.getByText("Veryfy OTP")).toBeInTheDocument();

    // Check if the user email is displayed
    expect(screen.getByText("user: test@example.com")).toBeInTheDocument();

    // Check if the submit button is rendered
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("validates the OTP input", async () => {
    render(<Page />);

    // Submit the form without entering OTP
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Check for validation error message
    await waitFor(() =>
      expect(
        screen.getByText("Your one-time password must be 6 characters.")
      ).toBeInTheDocument()
    );
  });

  it("submits the form successfully", async () => {
    // Mock fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, message: "OTP verified!" }),
      })
    ) as jest.Mock;

    render(<Page />);

    // Enter a valid OTP
    const otpInput = screen.getByLabelText("One-Time Password");
    fireEvent.change(otpInput, { target: { value: "123456" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Wait for success toast and navigation
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("OTP verified!");
      expect(mockPush).toHaveBeenCalledWith("/forgot-password/update-password/test@example.com");
    });
  });

  it("handles API error response", async () => {
    // Mock fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: true, message: "Invalid OTP!" }),
      })
    ) as jest.Mock;

    render(<Page />);

    // Enter a valid OTP
    const otpInput = screen.getByLabelText("One-Time Password");
    fireEvent.change(otpInput, { target: { value: "123456" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Wait for error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid OTP!");
    });
  });

  it("handles network errors gracefully", async () => {
    // Mock fetch API to throw an error
    global.fetch = jest.fn(() => Promise.reject(new Error("Network Error")));

    render(<Page />);

    // Enter a valid OTP
    const otpInput = screen.getByLabelText("One-Time Password");
    fireEvent.change(otpInput, { target: { value: "123456" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Wait for console error log
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(new Error("Network Error"));
    });
  });
});