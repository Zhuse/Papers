const request = require("supertest");
const app = require("../app.js");
const dbHandler = require("../dbHandler");
const UserModel = require("../models/UserModel.js");


/**
 * Clear all test data after all tests.
 */
beforeAll(async () => {
  await dbHandler.connect()
});

/**
 * Clear all test data after all tests.
 */
afterAll(async () => {
  await dbHandler.clearDatabase()
  await dbHandler.closeDatabase()
});



describe("Test the authentication endpoints.", () => {
  test("It should register a user.", async () => {
    const res = await request(app).post("/api/auth/register").send({
      password: "testpassword",
      firstName: "Steven",
      lastName: "Zhu",
      email: "stevenzhuubc@gmail.com"
    })
    expect(res.statusCode).toBe(200)
  });

  test("It should fail to confirm the user OTP with wrong OTP.", async () => {
    const res = await request(app).post("/api/auth/verify-otp").send({
      otp: "invalid",
      email: "stevenzhuubc@gmail.com"
    })
    expect(res.statusCode).toBe(401)
  });

  test("It should fail to login the user without confirming the OTP.", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "testpassword",
      email: "stevenzhuubc@gmail.com"
    })
    expect(res.statusCode).toBe(401)
  });

  test("It should confirm the user OTP.", async () => {
    const user = await UserModel.findOne({email: "stevenzhuubc@gmail.com"})
    const res = await request(app).post("/api/auth/verify-otp").send({
      otp: user.confirmOTP,
      email: "stevenzhuubc@gmail.com"
    })
    expect(res.statusCode).toBe(200)
  });

  test("It should login the user.", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "testpassword",
      email: "stevenzhuubc@gmail.com"
    })
    expect(res.statusCode).toBe(200)
  });

  test("It should fail to login the user with incorrect password.", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "testpasswordwrong",
      email: "stevenzhuubc@gmail.com"
    })
    expect(res.statusCode).toBe(401)
  });
});