const app = require("../src/app");

describe("App", () => {
  it('GET / responds with 404 containing "Not found"', () => {
    return supertest(app).get("/api/").expect(404);
  });
});
