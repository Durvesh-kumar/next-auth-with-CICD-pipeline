import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../Register";
import toast from "react-hot-toast";

// Mocking react-hot-toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("Register Component", () => {
  const mockSetLoading = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the registration form correctly", () => {
    render(<Register setLoading={mockSetLoading} />);

    // Check if all input fields are rendered
    expect(screen.getByLabelText("Username :")).toBeInTheDocument();
    expect(screen.getByLabelText("Email :")).toBeInTheDocument();
    expect(screen.getByLabelText("Password :")).toBeInTheDocument();
    expect(screen.getByLabelText("Conform-password :")).toBeInTheDocument();

    // Check if the submit button is rendered
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("validates the form inputs", async () => {
    render(<Register setLoading={mockSetLoading} />);

    // Submit the form without entering any values
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
      expect(screen.getByText("String must contain at least 6 character(s)")).toBeInTheDocument();
      expect(screen.getByText("String must contain at least 3 character(s)")).toBeInTheDocument();
    });
  });

  it("shows an error if passwords do not match", async () => {
    render(<Register setLoading={mockSetLoading} />);

    // Fill in the form with mismatched passwords
    fireEvent.change(screen.getByLabelText("Password :"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Conform-password :"), {
      target: { value: "password456" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Check for the password mismatch error
    await waitFor(() => {
      expect(
        screen.getByText("Password and Confirm-password does not match")
      ).toBeInTheDocument();
    });
  });

  it("submits the form successfully", async () => {
    // Mock fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, message: "Registration successful!" }),
      })
    ) as jest.Mock;

    render(<Register setLoading={mockSetLoading} />);

    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText("Username :"), {
      target: { value: "JohnDoe" },
    });
    fireEvent.change(screen.getByLabelText("Email :"), {
      target: { value: "johndoe@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password :"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Conform-password :"), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Wait for success toast and loading state
    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(toast.success).toHaveBeenCalledWith("Registration successful!");
    });
  });

  it("handles API error response", async () => {
    // Mock fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: true, message: "Registration failed!" }),
      })
    ) as jest.Mock;

    render(<Register setLoading={mockSetLoading} />);

    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText("Username :"), {
      target: { value: "JohnDoe" },
    });
    fireEvent.change(screen.getByLabelText("Email :"), {
      target: { value: "johndoe@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password :"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Conform-password :"), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Wait for error toast
    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(toast.error).toHaveBeenCalledWith("Registration failed!");
    });
  });
});