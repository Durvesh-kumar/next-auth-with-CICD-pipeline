import { POST } from "../route";
import { prisma } from "@/prisma";
import sendEmail from "@/helpers/nodemailer";
import { NextRequest } from "next/server";

jest.mock("@/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/helpers/nodemailer", () => jest.fn());

describe("POST /api/forgot-password/verify-email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if email is not provided", async () => {
    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ email: "" }),
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "All fields are required",
      success: false,
      error: true,
    });
  });

  it("should return 400 if user is not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(req);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "User not found",
      success: false,
      error: true,
    });
  });

  it("should return 400 if user is not verified", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-id",
      isVerified: false,
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "User not found",
      success: false,
      error: true,
    });
  });

  it("should send an email and return 200 if user is verified", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-id",
      isVerified: true,
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(req);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(sendEmail).toHaveBeenCalledWith({
      email: "test@example.com",
      emailType: "forgot-password",
      userId: "user-id",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "User verify successfully",
      success: true,
      error: false,
    });
  });

  it("should return 500 on server error", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("Database error"));

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(req);

    expect(response.status).toBe(500);
    expect(await response.text()).toBe("Internal Server Error");
  });
});