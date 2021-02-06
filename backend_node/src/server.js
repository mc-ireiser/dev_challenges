const app = require("./index").app;

const ws = require("ws");
const wsServer = new ws.Server({ noServer: true });

wsServer.on("connection", (socket) => {
	socket.on("message", (message) => {
		// socket.send(message);
		sendMessageToEveryClient(message);
	});
});

function sendMessageToEveryClient(message) {
	wsServer.clients.forEach((client) => {
		if (client !== ws) client.send(message);
	});
}

const PORT = process.env.PORT;
const ENV = process.env.NODE_ENV;

const server = app.listen(PORT, () => {
	console.log(`Backend Node.js in ${ENV} mode, listen in PORT: ${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
	wsServer.handleUpgrade(request, socket, head, (socket) => {
		wsServer.emit("connection", socket, request);
	});
});

module.exports = { server };
