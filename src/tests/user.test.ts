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

describe("User API", () => {
  beforeAll(async () => {
    // Clear the users collection and register a user before running tests
    await User.deleteMany({});
    const res = await request(app).post("/auth/register").send(mockUser);
    accessToken = res.body.accessToken;
  });

  it("should get user profile", async () => {
    const res = await request(app)
      .get("/users/profile")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("email", mockUser.email);
  });

  it("should update user email", async () => {
    const newEmail = "newemail@example.com";
    const res = await request(app)
      .put("/users/updateEmail")
      .send({ email: newEmail })
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("email", newEmail);
  });
});
