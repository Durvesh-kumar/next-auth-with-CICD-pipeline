import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";
import { CredentialsConfig } from "next-auth/providers/credentials";

jest.mock("@/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

describe("Credentials Provider - authorize function", () => {
  const mockAuthorize = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null if credentials are null", async () => {
    const result = await mockAuthorize(null);
    expect(result).toBeNull();
  });

  it("should throw an error if email is invalid", async () => {
    const credentials = { email: "invalid-email", password: "password123" };

    await expect(mockAuthorize(credentials)).rejects.toThrow("Invalid email");
  });

  it("should throw an error if user is not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const credentials = { email: "test@example.com", password: "password123" };

    await expect(mockAuthorize(credentials)).rejects.toThrow("User not found");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
  });

  it("should throw an error if user is not verified", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      isVerified: false,
    });

    const credentials = { email: "test@example.com", password: "password123" };

    await expect(mockAuthorize(credentials)).rejects.toThrow("User not Verified");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
  });

  it("should throw an error if password does not match", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      isVerified: true,
      password: "hashedPassword",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const credentials = { email: "test@example.com", password: "wrongpassword" };

    await expect(mockAuthorize(credentials)).rejects.toThrow(
      "Check your password and email!"
    );
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrongpassword",
      "hashedPassword"
    );
  });

  it("should return the user if credentials are valid", async () => {
    const mockUser = {
      id: "user-id",
      email: "test@example.com",
      isVerified: true,
      password: "hashedPassword",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const credentials = { email: "test@example.com", password: "password123" };

    const result = await mockAuthorize(credentials);

    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword"
    );
  });

  it("should throw an error if an unexpected error occurs", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const credentials = { email: "test@example.com", password: "password123" };

    await expect(mockAuthorize(credentials)).rejects.toThrow("Database error");
  });
});