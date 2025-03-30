import { POST } from "../route";
import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

jest.mock("@/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe("POST /api/forgot-password/update-password", () => {
  const mockNextResponse = {
    json: jest.fn(),
  };
  
  // Example usage in a test
  expect(mockNextResponse.json).toHaveBeenCalledWith({
    message: "Expected message",
    success: true,
    error: false,
  });

  it("should return 400 if required fields are missing", async () => {
    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ email: "", password: "", confirmPassword: "" }),
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "All fields are required",
      success: false,
      error: true,
    });
  });

  it("should return 400 if passwords do not match", async () => {
    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password456",
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "Password and conform password should be same",
      success: false,
      error: true,
    });
  });

  it("should return 400 if user is not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    });

    const response = await POST(req);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "Invalid User",
      success: false,
      error: true,
    });
  });

  it("should return 400 if forgotVerify is false", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-id",
      forgotVerify: false,
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "Invalid User",
      success: false,
      error: true,
    });
  });

  it("should update the password and return 200", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-id",
      forgotVerify: true,
    });
    (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    });

    const response = await POST(req);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-id" },
      data: {
        password: "hashedPassword",
        forgotVerify: false,
      },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Password update successfully",
      success: true,
      error: false,
    });
  });

  it("should return 500 on server error", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("Database error"));

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(500);
    expect(await response.text()).toBe("Internal Server Error");
  });
});