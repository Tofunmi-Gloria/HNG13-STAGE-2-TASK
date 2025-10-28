import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import {
  upsertCountry,
  dbAllCountries,
  dbGetCountry,
  dbDeleteCountry,
  saveSummaryImage
} from "../models/countryModel.js";

const COUNTRIES_API = "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
const EXCHANGE_API = "https://open.er-api.com/v6/latest/USD";

// Refresh countries and save summary image
export const refreshCountries = async (req, res) => {
  try {
    const [countriesRes, exchangeRes] = await Promise.all([
      fetch(COUNTRIES_API),
      fetch(EXCHANGE_API)
    ]);

    if (!countriesRes.ok || !exchangeRes.ok) {
      return res.status(503).json({
        error: "External data source unavailable",
        details: "Could not fetch data from API"
      });
    }

    const countries = await countriesRes.json();
    const exchangeRates = await exchangeRes.json();
    const now = new Date().toISOString();

    for (const country of countries) {
      const currency = country.currencies?.[0]?.code || null;
      const rate = currency && exchangeRates.rates[currency] ? exchangeRates.rates[currency] : null;
      const randomMultiplier = Math.floor(Math.random() * 1001) + 1000; // 1000-2000
      const estimated_gdp = rate ? (country.population * randomMultiplier) / rate : 0;

      await upsertCountry({
        name: country.name,
        capital: country.capital || null,
        region: country.region || null,
        population: country.population,
        currency_code: currency,
        exchange_rate: rate,
        estimated_gdp,
        flag_url: country.flag || null,
        last_refreshed_at: now
      });
    }

    // Generate summary image
    const allCountries = await dbAllCountries();
    const topCountries = allCountries
      .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
      .slice(0, 5);
    saveSummaryImage(topCountries, allCountries.length, now);

    res.json({ message: "✅ Countries refreshed successfully", last_refreshed_at: now });
  } catch (err) {
    console.error("❌ Refresh failed:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

// Get all countries with optional filters
export const getCountries = async (req, res) => {
  try {
    const { region, currency, sort } = req.query;
    let countries = await dbAllCountries();
    if (region) countries = countries.filter(c => c.region === region);
    if (currency) countries = countries.filter(c => c.currency_code === currency);
    if (sort === "gdp_desc") countries.sort((a, b) => b.estimated_gdp - a.estimated_gdp);
    res.json(countries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get single country by name
export const getCountryByName = async (req, res) => {
  try {
    const country = await dbGetCountry(req.params.name);
    if (!country) return res.status(404).json({ error: "Country not found" });
    res.json(country);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete country by name
export const deleteCountryByName = async (req, res) => {
  try {
    const result = await dbDeleteCountry(req.params.name);
    if (!result) return res.status(404).json({ error: "Country not found" });
    res.json({ message: `✅ ${req.params.name} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Serve summary image
export const getSummaryImage = (req, res) => {
  const imagePath = path.join("cache", "summary.png");
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: "Summary image not found" });
  }
  res.sendFile(path.resolve(imagePath));
};
