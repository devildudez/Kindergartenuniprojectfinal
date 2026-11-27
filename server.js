const express = require("express");
const path = require("node:path");
const { Pool } = require("pg");

const app = express();
const pool = new Pool();
const port = 8081;

app.use(express.static(path.join(__dirname, "public")));

const childQuery = `
    SELECT
        c.id,
        c.name AS "fullName",
        to_char(c.birthdate, 'YYYY-MM-DD') AS birthdate,
        c.group_id::text AS "groupId",
        c.status,
        g.name AS "guardianName",
        g.email AS "guardianEmail"
    FROM children AS c
    JOIN guardians AS g ON g.id = c.guardian_id
`;

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/children", async (req, res) => {
    const { rows } = await pool.query(childQuery + " ORDER BY c.id");
    res.json(rows);
});

app.get("/api/children/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
        return res.status(400).json({ message: "Invalid child ID." });
    }

    const { rows } = await pool.query(childQuery + " WHERE c.id = $1", [id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: "Child not found." });
    }

    res.json(rows[0]);
});

app.use((error, req, res, next) => {
    console.error(error.message);
    res.status(500).json({ message: "Could not load child records." });
});

app.listen(port, "127.0.0.1", () => {
    console.log(`Sprout House is running at http://127.0.0.1:${port}`);
});