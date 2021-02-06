/*global describe, it, context, before*/

const expect = require("chai").expect;
let create = require("apisauce").create;

const server = require("../src/server").server;
const port = process.env.PORT;

const api = create({
	baseURL: `http://localhost:${port}`,
	headers: { Accept: "application/json" },
});

describe("User workflow", () => {
	let statusCode, payload;

	context("Create user for first time", async () => {
		before(async function () {
			server.close();
			server.listen(port);

			const { status, data } = await api.post("/user", {
				name: "Test Name",
				userName: "userNameTest01",
			});

			statusCode = status;
			payload = data;

			server.close();
		});

		it("should return status code 201", () => {
			expect(statusCode).to.equal(201);
		});

		it("should contain the property name", () => {
			expect(payload).to.have.property("name");
		});

		it("should contain the property userName", () => {
			expect(payload).to.have.property("userName");
		});
	});

	context("Create same user", async () => {
		before(async function () {
			server.listen(port);

			const { status, data } = await api.post("/user", {
				name: "Test Name",
				userName: "userNameTest01",
			});

			statusCode = status;
			payload = data;

			server.close();
		});

		it("should return status code 409", () => {
			expect(statusCode).to.equal(409);
		});

		it("should contain the property message", () => {
			expect(payload).to.have.property("message");
		});

		it("should contain 'User already exists' message", () => {
			expect(payload.message).to.be.equal("User already exists");
		});
	});

	context("Invalid data", async () => {
		before(async function () {
			server.close();
			server.listen(port);

			const { status, data } = await api.post("/user", {
				name: "",
				userName: "",
			});

			statusCode = status;
			payload = data;

			server.close();
		});

		it("should return status code 400", () => {
			expect(statusCode).to.equal(400);
		});

		it("should contain the property message", () => {
			expect(payload).to.have.property("message");
		});

		it("should contain the 'All fields are required' message", () => {
			expect(payload.message).to.be.equal("All fields are required");
		});
	});
});
