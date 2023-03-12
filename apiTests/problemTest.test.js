const request = require("supertest");
const app = require("../app.js");
const bcrypt = require("bcrypt")
const dbHandler = require("../dbHandler");
const UserModel = require("../models/UserModel.js");

const user1Password = "testpassword"
const user1Email = "stevenzhuubc@gmail.com"

let user1Jwt;
let user2Jwt;

/** 
 * Insert dummy users.
 */
beforeAll(async () => {
  await dbHandler.connect()
  const hash = await bcrypt.hash(user1Password, 10)

  await new UserModel({
    firstName: "Steven",
    lastName: "Zhu",
    email: user1Email,
    password: hash,
    confirmOTP: null,
    isConfirmed: true
  }).save()

  const res = await request(app).post("/api/auth/login").send({
    password: user1Password,
    email: user1Email
  })
  user1Jwt = "Bearer " + res.body.data.token
})

/**
 * Clear all test data after every test.
 */
afterAll(async () => {
  await dbHandler.clearDatabase()
  await dbHandler.closeDatabase()
});

describe("Test the problem endpoints.", () => {
  let problemId;
  test("It should create a user submitted problem.", async () => {

    const res = await request(app).post("/api/problem").send({
      stdinTest: "testInput",
      description: "testDescription",
      parExec: "100",
      parMem: "100",
      expectedStdout: "testOutput"
    }).set('Authorization', user1Jwt)
    expect(res.statusCode).toBe(200)
    problemId = res.body.data.id
  });

  test("It should be able to retrieve a problem.", async () => {
    const res = await request(app).get("/api/problem/" + problemId).send().set("Authorization", user1Jwt)
    expect(res.statusCode).toBe(200)
  });

  test("It should be fail to retrieve a problem if the user is unauthorized.", async () => {
    const res = await request(app).get("/api/problem/" + problemId).send().set("Authorization", "Bearer 888")
    expect(res.statusCode).toBe(401)
  });

  test("It should fail to update a problem if the user is not authorized.", async () => {
    const res = await request(app).patch("/api/problem/" + problemId).send({
      stdinTest: "newStdIn",
      description: "newDescription",
      parExec: "101",
      parMem: "101",
      expectedStdout: "newOutput"
    }).set('Authorization', "invalid")
    expect(res.statusCode).toBe(401)
  });
  
  test("It should update a problem if the user is authorized.", async () => {
    const res = await request(app).patch("/api/problem/" + problemId).send({
      stdinTest: "newStdIn",
      description: "newDescription",
      parExec: "101",
      parMem: "101",
      expectedStdout: "newOutput"
    }).set('Authorization', user1Jwt)
    expect(res.statusCode).toBe(200)
  });

  test("It should be able to get the new problem details.", async () => {
    const res = await request(app).get("/api/problem/" + problemId).set('Authorization', user1Jwt)
    expect(res.statusCode).toBe(200)
    expect(res.body.data.stdinTest).toBe("newStdIn")
  });

  test("It should be able to get all the problems that the user created.", async () => {
    const postRes = await request(app).post("/api/problem").send({
      stdinTest: "testInpu2t",
      description: "testDescription2",
      parExec: "100",
      parMem: "100",
      expectedStdout: "testOutput"
    }).set('Authorization', user1Jwt)
    expect(postRes.statusCode).toBe(200)
    const res = await request(app).get("/api/problem").set('Authorization', user1Jwt)
    expect(res.statusCode).toBe(200)
    expect(res.body.data.length).toBe(2)
  });

});