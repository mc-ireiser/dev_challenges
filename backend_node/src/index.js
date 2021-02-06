const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

// Router
const homeRoute = require("./routes/home-route");
const resetRoutes = require("./routes/reset-route");
const issueRoutes = require("./routes/issue-route");
const userRoutes = require("./routes/user-route");

// Routes map
app.use("/", homeRoute);
app.use("/reset", resetRoutes);
app.use("/issue", issueRoutes);
app.use("/user", userRoutes);

module.exports = { app };
