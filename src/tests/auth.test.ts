import request from "supertest";
import app from "../server";
import mongoose from "mongoose";

type TestUser = {
  _id?: string;
  username: string;
  email: string;
  password: string;
  accessToken?: string;
  refreshToken?: string;
};

const user: TestUser = {
  username: `testuser${Date.now()}`,
  email: `testuser${Date.now()}@example.com`,
  password: "password123",
};

beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URL!);
});

afterAll(async () => {
  await mongoose.connection.close();
  // Clean up user created during the test
  if (user._id) {
    await request(app)
      .delete(`/users/${user._id}`)
      .set("Authorization", `Bearer ${user.accessToken}`);
  }
});

describe("Auth Routes", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send(user);
    console.log("Registration response:", res.body);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("username", user.username);
    expect(res.body).toHaveProperty("accessToken");
    user.accessToken = res.body.accessToken;
    user.refreshToken = res.body.refreshToken;
    user._id = res.body.user._id;
  });

  it("should login an existing user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: user.email,
      password: user.password,
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email", user.email);
    expect(res.body).toHaveProperty("accessToken");
    user.accessToken = res.body.accessToken;
    user.refreshToken = res.body.refreshToken;
  });

  it("should logout the user", async () => {
    const res = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        token: user.accessToken,
      });
    expect(res.statusCode).toEqual(200);
  });

  it("should refresh the user token", async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: user.email,
      password: user.password,
    });
    const refreshToken = loginRes.body.refreshToken;

    const res = await request(app)
      .get("/auth/refresh")
      .set("Authorization", `Bearer ${refreshToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("accessToken");
    user.accessToken = res.body.accessToken;
  });
});
