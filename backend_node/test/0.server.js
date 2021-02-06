/*global describe, it, before*/

const expect = require("chai").expect;
let create = require("apisauce").create;

const server = require("../src/server").server;
const port = process.env.PORT;

const api = create({
	baseURL: `http://localhost:${port}`,
	headers: { Accept: "application/json" },
});

describe("Node Server 'OK'", () => {
	let statusCode, payload;

	before(async function () {
		server.close();
		server.listen(port);

		const { status, data } = await api.get("/");

		statusCode = status;
		payload = data;

		server.close();
	});

	it("should return status code 200", async () => {
		expect(statusCode).to.equal(200);
	});

	it("should contain the property description", async () => {
		expect(payload).to.have.property("descripcion");
	});

	it("should contain the property autor", async () => {
		expect(payload).to.have.property("autor");
	});
});
