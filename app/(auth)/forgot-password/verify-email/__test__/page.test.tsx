import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Page from "../page";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Mocking next/navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mocking react-hot-toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("Verify Email Page", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the email verification form correctly", () => {
    render(<Page />);

    // Check if the heading is rendered
    expect(screen.getByText("Veryfy OTP")).toBeInTheDocument();

    // Check if the input field and submit button are rendered
    expect(screen.getByLabelText("Email:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("validates the email input", async () => {
    render(<Page />);

    // Submit the form without entering an email
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Check for validation error message
    await waitFor(() =>
      expect(
        screen.getByText("Email must be at least 2 characters.")
      ).toBeInTheDocument()
    );
  });

  it("submits the form successfully", async () => {
    // Mock fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, message: "Email verified successfully!" }),
      })
    ) as jest.Mock;

    render(<Page />);

    // Enter a valid email
    fireEvent.change(screen.getByLabelText("Email:"), {
      target: { value: "test@example.com" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Wait for success toast and navigation
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Email verified successfully!");
      expect(mockPush).toHaveBeenCalledWith("/forgot-password/test@example.com");
    });
  });

  it("handles API error response", async () => {
    // Mock fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: true, message: "Invalid email!" }),
      })
    ) as jest.Mock;

    render(<Page />);

    // Enter a valid email
    fireEvent.change(screen.getByLabelText("Email:"), {
      target: { value: "test@example.com" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Wait for error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid email!");
    });
  });

  it("handles network errors gracefully", async () => {
    // Mock fetch API to throw an error
    global.fetch = jest.fn(() => Promise.reject(new Error("Network Error")));

    render(<Page />);

    // Enter a valid email
    fireEvent.change(screen.getByLabelText("Email:"), {
      target: { value: "test@example.com" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Wait for console error log
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(new Error("Network Error"));
    });
  });
});