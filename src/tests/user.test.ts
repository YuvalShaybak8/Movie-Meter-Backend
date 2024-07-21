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

describe("User Routes", () => {
  beforeAll(async () => {
    const res = await request(app).post("/auth/register").send(user);

    console.log("Registration response:", res.body);

    user.accessToken = res.body.accessToken;
    user.refreshToken = res.body.refreshToken;
    user._id = res.body.user._id;
  });

  it("should retrieve a list of users", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${user.accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should retrieve a single user by ID", async () => {
    const res = await request(app)
      .get(`/users/${user._id}`)
      .set("Authorization", `Bearer ${user.accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("_id", user._id);
  });

  it("should update the user", async () => {
    const res = await request(app)
      .put(`/users/${user._id}`)
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        username: "updateduser",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("username", "updateduser");
  });
});
