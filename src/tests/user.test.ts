import request from "supertest";
import { app } from "../server";
import mongoose from "mongoose";
import User from "../models/userModel";

const testUser = {
  username: "TestUser",
  email: "testuser@example.com",
  password: "password123",
};

type AuthUser = {
  username: string;
  email: string;
  password: string;
  accessToken?: string;
};

const authUser: AuthUser = {
  username: "AuthUser",
  email: "authuser@example.com",
  password: "authpassword123",
};

beforeAll(async () => {
  console.log("Before all");
  await User.deleteMany({});
  await request(app).post("/auth/register").send(authUser);
  const res = await request(app).post("/auth/login").send(authUser);
  authUser.accessToken = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Tests", () => {
  test("Test get all users", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", "Bearer " + authUser.accessToken);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test("Test create user", async () => {
    const res = await request(app).post("/auth/register").send(testUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body.user.username).toEqual(testUser.username);
    expect(res.body.user.email).toEqual(testUser.email);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  test("Test get user by id", async () => {
    const createRes = await request(app)
      .post("/auth/register")
      .send({
        ...testUser,
        email: "getuser@example.com",
      });
    const userId = createRes.body.user._id;

    const res = await request(app)
      .get(`/users/${userId}`)
      .set("Authorization", "Bearer " + authUser.accessToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body.username).toEqual(testUser.username);
    expect(res.body.email).toEqual("getuser@example.com");
  });

  test("Test update user", async () => {
    const createRes = await request(app)
      .post("/auth/register")
      .send({
        ...testUser,
        email: "updateuser@example.com",
      });
    const userId = createRes.body.user._id;

    const updatedData = {
      username: "UpdatedUser",
    };

    const res = await request(app)
      .put(`/users/${userId}`)
      .set("Authorization", "Bearer " + authUser.accessToken)
      .send(updatedData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.username).toEqual(updatedData.username);
  });

  test("Test update user with profile picture", async () => {
    const createRes = await request(app)
      .post("/auth/register")
      .send({
        ...testUser,
        email: "updateuserwithpic@example.com",
      });
    const userId = createRes.body.user._id;

    const res = await request(app)
      .put(`/users/${userId}`)
      .set("Authorization", "Bearer " + authUser.accessToken)
      .field("username", "UpdatedUserWithPic")
      .attach("profilePic", "path/to/test/image.jpg"); // Ensure this path is correct

    expect(res.statusCode).toEqual(200);
    expect(res.body.username).toEqual("UpdatedUserWithPic");
    expect(res.body.profilePic).toBeDefined();
  });
});
