import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { createCanvas } from "canvas";

const db = new sqlite3.Database("./country.db", (err) => {
  if (err) console.error("❌ Database connection failed:", err.message);
  else console.log("✅ Connected to SQLite database.");
});

// Create table with all required columns
export const createTable = () => {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS countries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        capital TEXT,
        region TEXT,
        population INTEGER NOT NULL,
        currency_code TEXT,
        exchange_rate REAL,
        estimated_gdp REAL,
        flag_url TEXT,
        last_refreshed_at TEXT
      )`,
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

// Insert or update country (UPSERT)
export const upsertCountry = (country) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO countries 
      (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        capital = excluded.capital,
        region = excluded.region,
        population = excluded.population,
        currency_code = excluded.currency_code,
        exchange_rate = excluded.exchange_rate,
        estimated_gdp = excluded.estimated_gdp,
        flag_url = excluded.flag_url,
        last_refreshed_at = excluded.last_refreshed_at`,
      [
        country.name,
        country.capital,
        country.region,
        country.population,
        country.currency_code,
        country.exchange_rate,
        country.estimated_gdp,
        country.flag_url,
        country.last_refreshed_at,
      ],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

// Get all countries
export const dbAllCountries = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM countries", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Get country by name
export const dbGetCountry = (name) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM countries WHERE name = ?", [name], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Delete country by name
export const dbDeleteCountry = (name) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM countries WHERE name = ?", [name], function(err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

// Save summary image
export const saveSummaryImage = (topCountries, totalCountries, lastRefreshed) => {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text
  ctx.fillStyle = "#000000";
  ctx.font = "28px Arial";
  ctx.fillText(`Total Countries: ${totalCountries}`, 50, 50);
  ctx.fillText(`Last Refreshed: ${lastRefreshed}`, 50, 100);
  ctx.fillText("Top 5 Countries by GDP:", 50, 150);

  topCountries.forEach((c, i) => {
    ctx.fillText(`${i + 1}. ${c.name} - ${Math.round(c.estimated_gdp)}`, 50, 200 + i * 50);
  });

  // Ensure cache folder exists
  if (!fs.existsSync("cache")) fs.mkdirSync("cache");

  // Save image
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join("cache", "summary.png"), buffer);
};
