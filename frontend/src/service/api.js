import { create } from "apisauce";

// define the api
const http = create({
	baseURL: "http://localhost:8082",
	headers: { Accept: "application/json" }
});

export default http;
