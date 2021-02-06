/*global describe, it, before, beforeEach afterEach*/

const expect = require("chai").expect;
let create = require("apisauce").create;

const server = require("../src/server").server;
const port = process.env.PORT;

const api = create({
	baseURL: `http://localhost:${port}`,
	headers: { Accept: "application/json" },
});

describe("Reset DB", () => {
	before(function () {
		server.close();
	});

	beforeEach(function () {
		server.listen(port);
	});

	afterEach(function () {
		server.close();
	});

	it("should return status code 200", async () => {
		const { status } = await api.get("/reset");
		expect(status).to.equal(200);
	});

	it("should contain the property message", async () => {
		const { data } = await api.get("/reset");
		expect(data).to.have.property("message");
	});

	it("should contain 'The database was deleted' message", async () => {
		const { data } = await api.get("/reset");
		expect(data.message).to.be.equal("The database was deleted");
	});
});
