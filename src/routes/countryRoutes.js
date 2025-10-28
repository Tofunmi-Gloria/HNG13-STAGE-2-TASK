import express from "express";
import { 
  refreshCountries, 
  getCountries, 
  getCountryByName, 
  deleteCountryByName, 
  getSummaryImage 
} from "../controllers/countryController.js";

const router = express.Router();

// Refresh all countries
router.post("/refresh", refreshCountries);

// Serve summary image **before** the :name route
router.get("/image", getSummaryImage);

// Get all countries
router.get("/", getCountries);

// Get one country by name
router.get("/:name", getCountryByName);

// Delete a country by name
router.delete("/:name", deleteCountryByName);

export default router;
