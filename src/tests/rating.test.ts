import request from "supertest";
import app from "../server";
import Rating from "../models/ratingModel";
import User from "../models/userModel";

// Mock data
const mockUser = {
  username: "testuser",
  email: "testuser@example.com",
  password: "password123",
};

const mockRating = {
  title: "Test Movie",
  rating: 5,
};

let accessToken: string;
let ratingId: string;

describe("Rating API", () => {
  beforeAll(async () => {
    // Clear the ratings and users collections before running tests
    await Rating.deleteMany({});
    await User.deleteMany({});
    const res = await request(app).post("/auth/register").send(mockUser);
    accessToken = res.body.accessToken;
  });

  it("should create a new rating", async () => {
    const res = await request(app)
      .post("/ratings")
      .send(mockRating)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("title", mockRating.title);
    expect(res.body).toHaveProperty("rating", mockRating.rating);
    ratingId = res.body._id;
  });

  it("should get all ratings", async () => {
    const res = await request(app)
      .get("/ratings")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should update a rating", async () => {
    const updatedRating = { title: "Updated Movie", rating: 4 };
    const res = await request(app)
      .put(`/ratings/${ratingId}`)
      .send(updatedRating)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("title", updatedRating.title);
    expect(res.body).toHaveProperty("rating", updatedRating.rating);
  });

  it("should delete a rating", async () => {
    const res = await request(app)
      .delete(`/ratings/${ratingId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
