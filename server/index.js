const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const { Pool } = require("pg");

const PORT = Number(process.env.PORT || 3000);
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_RESET_TOKEN = normalizeActorName(process.env.ADMIN_RESET_TOKEN || "");
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOW_ANY_ORIGIN = ALLOWED_ORIGINS.length === 0;

function normalizeActorName(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

function sameActorName(left, right) {
  return normalizeActorName(left).toLowerCase() === normalizeActorName(right).toLowerCase();
}

function hashPin(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readAdminToken(req) {
  return normalizeActorName(
    req.headers["x-admin-token"] ||
      req.query?.token ||
      req.body?.token ||
      ""
  );
}

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
  const actorName = normalizeActorName(req.body?.actorName);
  const actorToken = normalizeActorName(req.body?.actorToken);
  const actorPin = normalizeActorName(req.body?.actorPin);

  if (!itemId) {
    return res.status(400).json({ error: "invalid_item_id" });
  }
  if (!actorName) {
    return res.status(400).json({ error: "actor_name_required" });
  }
  if (!actorToken) {
    return res.status(400).json({ error: "actor_token_required" });
  }
  if (!actorPin || actorPin.length < 4) {
    return res.status(400).json({ error: "actor_pin_required" });
  }

  try {
    const result = await pool.query("select reserve_gift_item($1, $2, $3, $4) as success", [
      itemId,
      actorName,
      actorToken,
      hashPin(actorPin)
    ]);
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
  const actorName = normalizeActorName(req.body?.actorName);
  const actorToken = normalizeActorName(req.body?.actorToken);
  const actorPin = normalizeActorName(req.body?.actorPin);
  const actorPinHash = actorPin ? hashPin(actorPin) : null;

  if (!itemId) {
    return res.status(400).json({ error: "invalid_item_id" });
  }
  if (!actorName) {
    return res.status(400).json({ error: "actor_name_required" });
  }
  if (!actorToken) {
    return res.status(400).json({ error: "actor_token_required" });
  }

  try {
    const itemResult = await pool.query(
      `
      select id, is_reserved, reserved_by, reserved_device_token, reserved_pin_hash
      from gift_items
      where id = $1
      `,
      [itemId]
    );

    if (itemResult.rowCount === 0) {
      return res.status(404).json({ error: "item_not_found" });
    }

    const item = itemResult.rows[0];
    if (!item.is_reserved) {
      return res.status(409).json({ error: "item_already_available_or_not_found" });
    }

    const tokenMatches = item.reserved_device_token === actorToken;
    const legacyOwnerMatches = !item.reserved_device_token && sameActorName(item.reserved_by, actorName);
    const pinMatches =
      Boolean(actorPinHash) &&
      item.reserved_pin_hash === actorPinHash &&
      sameActorName(item.reserved_by, actorName);

    if (!tokenMatches && !legacyOwnerMatches && !pinMatches) {
      return res.status(403).json({ error: "item_reserved_by_another_user" });
    }

    const result = await pool.query("select release_gift_item($1, $2, $3, $4) as success", [
      itemId,
      actorName,
      actorToken,
      actorPinHash
    ]);
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

app.post("/api/admin/reset-reservations", async (req, res) => {
  if (!ADMIN_RESET_TOKEN) {
    return res.status(503).json({ error: "admin_reset_token_not_configured" });
  }

  const requestToken = readAdminToken(req);
  if (!requestToken || requestToken !== ADMIN_RESET_TOKEN) {
    return res.status(403).json({ error: "forbidden" });
  }

  try {
    const result = await pool.query(`
      update gift_items
      set
        is_reserved = false,
        reserved_by = null,
        reserved_device_token = null,
        reserved_pin_hash = null,
        reserved_at = null
      where is_reserved = true
    `);

    return res.json({ ok: true, resetCount: result.rowCount });
  } catch (error) {
    console.error("reset reservations error", error);
    return res.status(500).json({ error: "failed_to_reset_reservations" });
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
