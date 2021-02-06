/*global describe, it, context, before*/

const expect = require("chai").expect;
let create = require("apisauce").create;

const server = require("../src/server").server;
const port = process.env.PORT;

const api = create({
	baseURL: `http://localhost:${port}`,
	headers: { Accept: "application/json" },
});

describe("Get issue", () => {
	let statusCode, payload;

	context("Get all issue", async () => {
		before(async function () {
			server.close();
			server.listen(port);

			const { status, data } = await api.get("/issue/all");

			statusCode = status;
			payload = data;

			server.close();
		});

		it("should return status code 200", () => {
			expect(statusCode).to.equal(200);
		});

		it("should contain the property issues", () => {
			expect(payload).to.have.property("issues");
		});

		it("should contain the property issues whith issue 1", () => {
			expect(payload.issues[0]).to.be.equal("1");
		});
	});

	context("Get one issue", async () => {
		before(async function () {
			server.close();
			server.listen(port);

			const { status, data } = await api.get("/issue/1");

			statusCode = status;
			payload = data;

			server.close();
		});

		it("should return status code 200", () => {
			expect(statusCode).to.equal(200);
		});

		it("should contain the property issue", () => {
			expect(payload).to.have.property("issue");
		});

		it("should contain the property status in issue", () => {
			expect(payload.issue).to.have.property("status");
		});

		it("should contain the property members in issue", () => {
			expect(payload.issue).to.have.property("members");
		});
	});
});
