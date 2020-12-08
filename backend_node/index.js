const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");
const ws = require("ws");

app.use(bodyParser.json());
app.use(cors());

const wsServer = new ws.Server({ noServer: true });

wsServer.on("connection", (socket) => {
	socket.on("message", (message) => {
		//socket.send(message);
		sendMessageToEveryClient(message);
	});
});

function sendMessageToEveryClient(message) {
	wsServer.clients.forEach((client) => {
		if (client !== ws) client.send(message);
	});
}

// Router
const resetRoutes = require("./routes/reset-route");
const issueRoutes = require("./routes/issue-route");
const userRoutes = require("./routes/user-route");

// Routes map
app.use("/reset", resetRoutes);
app.use("/issue", issueRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 8082;

const server = app.listen(PORT, () => {
	console.log(`Backend node listen in PORT: ${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
	wsServer.handleUpgrade(request, socket, head, (socket) => {
		wsServer.emit("connection", socket, request);
	});
});

module.exports = app;
