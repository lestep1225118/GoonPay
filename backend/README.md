# MoonPay Backend

Node.js + Express API for MoonPay (auth, classes, transactions, MongoDB).

## Setup

1. `npm install`
2. Configure `.env` in this folder (e.g. `MONGO_URI`, `JWT_SECRET`). Copy from a template if needed.
3. Ensure MongoDB is running.
4. `npm start` (runs `node server.js`)

The API connects to the frontend; run the frontend from the project root with `npm run dev`.