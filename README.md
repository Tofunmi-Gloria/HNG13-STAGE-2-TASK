Sure! Here’s a ready-to-copy README.md for your project:

# Country Currency & Exchange API

A RESTful API that fetches country data from external APIs, caches it in a SQLite database, and provides CRUD operations along with a summary image.

---

## Features

- Fetch country data from [REST Countries API](https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies).  
- Fetch exchange rates from [Exchange Rates API](https://open.er-api.com/v6/latest/USD).  
- Calculate `estimated_gdp = population × random(1000–2000) ÷ exchange_rate`.  
- Cache country data in SQLite.  
- CRUD endpoints for country records.  
- Generate a summary image with total countries and top 5 countries by GDP.  

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/countries/refresh` | Fetch and cache all countries and exchange rates. Generates summary image. |
| `GET` | `/countries` | Get all countries. Supports filters: `?region=Africa`, `?currency=NGN`, `?sort=gdp_desc`. |
| `GET` | `/countries/:name` | Get one country by name. |
| `DELETE` | `/countries/:name` | Delete a country by name. |
| `GET` | `/status` | Show total countries and last refresh timestamp. |
| `GET` | `/countries/image` | Serve the summary image (`cache/summary.png`). Returns 404 if image not found. |

---

## Database

- SQLite database: `country.db`  
- Table: `countries`  

Columns:

- `id` — auto-generated  
- `name` — required  
- `capital` — optional  
- `region` — optional  
- `population` — required  
- `currency_code` — required  
- `exchange_rate` — required  
- `estimated_gdp` — computed  
- `flag_url` — optional  
- `last_refreshed_at` — auto timestamp  

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Tofunmi-Gloria/HNG13-STAGE-2-TASK
cd country-api

	2.	Install dependencies:

npm install

	3.	Create .env file if needed for configuration (port, etc.):

PORT=5000

	4.	Run the server:

node src/server.js


⸻

Usage
	•	Refresh all countries and generate summary:

POST http://localhost:5000/countries/refresh

	•	Get all countries:

GET http://localhost:5000/countries

	•	Get a single country by name:

GET http://localhost:5000/countries/Nigeria

	•	Delete a country:

DELETE http://localhost:5000/countries/Nigeria

	•	Get summary image:

GET http://localhost:5000/countries/image

	•	Check API status:

GET http://localhost:5000/status


⸻

Notes
	•	The summary image shows total countries and the top 5 countries by GDP.
	•	If a country has no currency, exchange rate and estimated GDP will be null.
	•	Refreshing countries replaces cached data.
	•	All responses are JSON, except the summary image endpoint.

⸻
