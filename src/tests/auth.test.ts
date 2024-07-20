import { Request, Response } from "express";
import authController from "../controllers/authController";
import User from "../models/userModel";
import jwt from "jsonwebtoken";

jest.mock("../models/userModel");
jest.mock("jsonwebtoken");

describe("AuthController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
      }),
      send: jest.fn().mockImplementation((result) => {
        responseObject = result;
      }),
    };
    responseObject = {};
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should create a new user and return tokens", async () => {
      mockRequest.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        _id: "user1",
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword",
      };

      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("fakeToken");

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toHaveProperty("user");
      expect(responseObject).toHaveProperty("accessToken");
      expect(responseObject).toHaveProperty("refreshToken");
    });

    it("should handle errors during registration", async () => {
      mockRequest.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      (User.create as jest.Mock).mockRejectedValue(new Error("Database error"));

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toHaveProperty(
        "message",
        "Error registering user"
      );
    });
  });

  describe("login", () => {
    it("should login user and return tokens", async () => {
      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        _id: "user1",
        email: "test@example.com",
        password: "hashedPassword",
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("fakeToken");

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toHaveProperty("user");
      expect(responseObject).toHaveProperty("accessToken");
      expect(responseObject).toHaveProperty("refreshToken");
    });

    it("should handle invalid login", async () => {
      mockRequest.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const mockUser = {
        _id: "user1",
        email: "test@example.com",
        password: "hashedPassword",
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toHaveProperty("message", "Invalid credentials");
    });

    it("should handle errors during login", async () => {
      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      (User.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toHaveProperty("message", "Error logging in");
    });
  });

  describe("refresh", () => {
    it("should refresh tokens", async () => {
      mockRequest.body = {
        refreshToken: "validRefreshToken",
      };

      (jwt.verify as jest.Mock).mockReturnValue({ _id: "user1" });
      (jwt.sign as jest.Mock).mockReturnValue("newAccessToken");

      await authController.refresh(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toHaveProperty("accessToken", "newAccessToken");
    });

    it("should handle invalid refresh token", async () => {
      mockRequest.body = {
        refreshToken: "invalidRefreshToken",
      };

      (jwt.verify as jest.Mock).mockRejectedValue(new Error("Invalid token"));

      await authController.refresh(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject).toHaveProperty("message", "Invalid token");
    });

    it("should handle errors during token refresh", async () => {
      mockRequest.body = {
        refreshToken: "validRefreshToken",
      };

      (jwt.verify as jest.Mock).mockReturnValue({ _id: "user1" });
      (jwt.sign as jest.Mock).mockRejectedValue(new Error("Database error"));

      await authController.refresh(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toHaveProperty(
        "message",
        "Error refreshing token"
      );
    });
  });

  describe("logout", () => {
    it("should logout user", async () => {
      mockRequest.body = {
        refreshToken: "validRefreshToken",
      };

      await authController.logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toBe("Logout successful");
    });

    it("should handle errors during logout", async () => {
      mockRequest.body = {
        refreshToken: "invalidRefreshToken",
      };

      (jwt.verify as jest.Mock).mockRejectedValue(new Error("Invalid token"));

      await authController.logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject).toHaveProperty("message", "Invalid token");
    });
  });
});
