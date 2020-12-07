const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

// Router
const resetRoutes = require("./routes/reset-route");
const issueRoutes = require("./routes/issue-route");
const userRoutes = require("./routes/user-route");

// Routes map
app.use("/reset", resetRoutes);
app.use("/issue", issueRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
	console.log(`Backend node listen in PORT: ${PORT}`);
});

module.exports = app;
