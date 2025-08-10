require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/user");
const walletRoutes = require("./routes/wallet");
const activeRoutes = require("./routes/active");

const app = express();

app.use(cors());
app.use(express.json());

// Register routes per module
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/active", activeRoutes);

app.get("/", (_, res) => res.send("API Server Running 💞"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API Server running on port ${PORT}`));
