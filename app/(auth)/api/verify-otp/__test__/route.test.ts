import { prisma } from "@/prisma";
import { NextRequest } from "next/server";
import { POST } from "../route";

jest.mock("@/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("POST /api/verify-otp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        values: { pin: "123456" },
        userEmail: encodeURIComponent("test@example.com"),
      }),
    });

    const response = await POST(req);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      message: "Invalid user",
      success: false,
      error: true,
    });
  });

  it("should return 402 if OTP is expired", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      verifyOtpExpiry: new Date(Date.now() - 1000).toISOString(), // Expired OTP
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        values: { pin: "123456" },
        userEmail: encodeURIComponent("test@example.com"),
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(402);
    expect(await response.json()).toEqual({
      message: "OTP is expired",
      success: false,
      error: true,
    });
  });

  it("should return 403 if OTP is invalid", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      verifyOtp: "654321",
      verifyOtpExpiry: new Date(Date.now() + 1000).toISOString(), // Valid OTP expiry
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        values: { pin: "123456" },
        userEmail: encodeURIComponent("test@example.com"),
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      message: "Invalid OTP",
      success: false,
      error: true,
    });
  });

  it("should update user and return 200 if OTP is valid", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-id",
      verifyOtp: "123456",
      verifyOtpExpiry: new Date(Date.now() + 1000).toISOString(), // Valid OTP expiry
    });

    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        values: { pin: "123456" },
        userEmail: encodeURIComponent("test@example.com"),
      }),
    });

    const response = await POST(req);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      data: {
        isVerified: true,
        verifyOtp: undefined,
        verifyOtpExpiry: undefined,
      },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "OTP verify successfully",
      success: true,
      error: false,
    });
  });

  it("should return 500 on server error", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("Database error"));

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        values: { pin: "123456" },
        userEmail: encodeURIComponent("test@example.com"),
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(500);
    expect(await response.text()).toBe("Internal Server Error");
  });
});