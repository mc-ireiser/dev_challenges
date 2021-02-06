/*global describe, it, context, before*/

const expect = require("chai").expect;
let create = require("apisauce").create;

const server = require("../src/server").server;
const port = process.env.PORT;

const api = create({
	baseURL: `http://localhost:${port}`,
	headers: { Accept: "application/json" },
});

describe("Login", () => {
	let statusCode, payload;

	context("Registered user", async () => {
		before(async function () {
			server.close();
			server.listen(port);

			const { status, data } = await api.post(
				"/user/login",
				{},
				{ headers: { userName: "userNameTest01" } }
			);

			statusCode = status;
			payload = data;

			server.close();
		});

		it("should return status code 200", () => {
			expect(statusCode).to.equal(200);
		});

		it("should contain the property name", () => {
			expect(payload).to.have.property("name");
		});

		it("should contain the name 'Test Name'", () => {
			expect(payload.name).to.be.equal("Test Name");
		});
	});

	context("Unregistered user", async () => {
		before(async function () {
			server.close();
			server.listen(port);

			const { status, data } = await api.post(
				"/user/login",
				{},
				{ headers: { userName: "userNameTest02" } }
			);

			statusCode = status;
			payload = data;

			server.close();
		});

		it("should return status code 404", () => {
			expect(statusCode).to.equal(404);
		});

		it("should contain the property message", () => {
			expect(payload).to.have.property("message");
		});

		it("should contain the 'User was not found' message", () => {
			expect(payload.message).to.be.equal("User was not found");
		});
	});

	context("Invalid data", async () => {
		before(async function () {
			server.close();
			server.listen(port);

			const { status, data } = await api.post(
				"/user/login",
				{},
				{ headers: { userName: "" } }
			);

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

		it("should contain the 'Username required' message", () => {
			expect(payload.message).to.be.equal("Username required");
		});
	});
});
