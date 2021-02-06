/*global describe, it, context, before*/

const expect = require("chai").expect;
let create = require("apisauce").create;

const server = require("../src/server").server;
const port = process.env.PORT;

const api = create({
	baseURL: `http://localhost:${port}`,
	headers: { Accept: "application/json" },
});

describe("Join issue", () => {
	let statusCode, payload;

	context("Join new issue", async () => {
		before(async function () {
			server.close();
			server.listen(port);

			const { status, data } = await api.post(
				"/issue/1/join",
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

		it("should contain the property message", () => {
			expect(payload).to.have.property("message");
		});

		it("should contain the 'A new issue was created' message", () => {
			expect(payload.message).to.be.equal("A new issue was created");
		});
	});

	context("Join same issue", async () => {
		before(async function () {
			server.close();
			server.listen(port);

			const { status, data } = await api.post(
				"/issue/1/join",
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

		it("should contain the property message", () => {
			expect(payload).to.have.property("message");
		});

		it("should contain the 'The user was already attached to the issue' message", () => {
			expect(payload.message).to.be.equal(
				"The user was already attached to the issue"
			);
		});
	});
});
