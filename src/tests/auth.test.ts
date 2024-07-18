import request from "supertest";
import app from "../server";
import User from "../models/userModel";

// Mock user data
const mockUser = {
  username: "testuser",
  email: "testuser@example.com",
  password: "password123",
};

let accessToken: string;
let refreshToken: string;

describe("Auth API", () => {
  beforeAll(async () => {
    // Clear the users collection before running tests
    await User.deleteMany({});
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send(mockUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("should log in an existing user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: mockUser.email, password: mockUser.password });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");

    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it("should refresh the access token", async () => {
    const res = await request(app).post("/auth/refresh").send({ refreshToken });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("should log out the user", async () => {
    const res = await request(app)
      .post("/auth/logout")
      .send({ token: refreshToken });
    expect(res.statusCode).toEqual(200);
  });
});
