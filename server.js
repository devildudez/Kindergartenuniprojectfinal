const express = require("express");
const path = require("node:path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(8081, () => {
    console.log("Sprout House is running at http://localhost:8081");
});