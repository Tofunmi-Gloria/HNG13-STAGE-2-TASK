import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import countryRoutes from "./routes/countryRoutes.js";
import { createTable } from "./models/countryModel.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// routes
app.use("/countries", countryRoutes);
app.get("/status", async (req, res) => {
  try {
    const { dbAllCountries } = await import("./models/countryModel.js");
    const countries = await dbAllCountries();
    const lastRefreshed = countries.length > 0 ? countries[0].last_refreshed_at : null;
    res.json({ total_countries: countries.length, last_refreshed_at: lastRefreshed });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
createTable().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
