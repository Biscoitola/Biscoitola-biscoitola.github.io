const fs = require("fs");
const path = require("path");
const express = require("express");
const { Pool } = require("pg");

const PORT = Number(process.env.PORT || 3000);
const DATABASE_URL = process.env.DATABASE_URL;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOW_ANY_ORIGIN = ALLOWED_ORIGINS.length === 0;

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined
});

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = Boolean(origin) && (ALLOW_ANY_ORIGIN || ALLOWED_ORIGINS.includes(origin));

  if (isAllowed) {
    if (ALLOW_ANY_ORIGIN) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    } else {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(isAllowed ? 204 : 403);
  }

  return next();
});

app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ ok: true });
  } catch (error) {
    console.error("health error", error);
    res.status(500).json({ ok: false, error: "database_unavailable" });
  }
});

app.get("/api/items", async (_req, res) => {
  try {
    const result = await pool.query(
      `
      select
        id,
        category_id,
        name,
        description,
        is_reserved,
        reserved_by,
        reserved_at,
        updated_at
      from gift_items
      order by category_id, name
      `
    );

    res.json({ items: result.rows });
  } catch (error) {
    console.error("list items error", error);
    res.status(500).json({ error: "failed_to_list_items" });
  }
});

app.post("/api/items/:id/reserve", async (req, res) => {
  const itemId = String(req.params.id || "").trim();
  const actorName = typeof req.body?.actorName === "string" ? req.body.actorName : null;

  if (!itemId) {
    return res.status(400).json({ error: "invalid_item_id" });
  }

  try {
    const result = await pool.query("select reserve_gift_item($1, $2) as success", [itemId, actorName]);
    const success = result.rows[0]?.success === true;

    if (!success) {
      return res.status(409).json({ error: "item_already_reserved_or_not_found" });
    }

    return res.json({ ok: true, reserved: true, itemId });
  } catch (error) {
    console.error("reserve item error", error);
    return res.status(500).json({ error: "failed_to_reserve_item" });
  }
});

app.post("/api/items/:id/release", async (req, res) => {
  const itemId = String(req.params.id || "").trim();
  const actorName = typeof req.body?.actorName === "string" ? req.body.actorName : null;

  if (!itemId) {
    return res.status(400).json({ error: "invalid_item_id" });
  }

  try {
    const result = await pool.query("select release_gift_item($1, $2) as success", [itemId, actorName]);
    const success = result.rows[0]?.success === true;

    if (!success) {
      return res.status(409).json({ error: "item_already_available_or_not_found" });
    }

    return res.json({ ok: true, reserved: false, itemId });
  } catch (error) {
    console.error("release item error", error);
    return res.status(500).json({ error: "failed_to_release_item" });
  }
});

app.use(express.static(path.resolve(__dirname, "..")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "not_found" });
  }

  return res.sendFile(path.resolve(__dirname, "..", "index.html"));
});

async function ensureDatabaseReady() {
  const schemaSql = fs.readFileSync(path.resolve(__dirname, "..", "database", "schema.sql"), "utf8");
  const seedSql = fs.readFileSync(path.resolve(__dirname, "..", "database", "seed_items.sql"), "utf8");
  await pool.query(schemaSql);
  await pool.query(seedSql);
}

async function start() {
  try {
    await ensureDatabaseReady();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("startup error", error);
    process.exit(1);
  }
}

void start();
