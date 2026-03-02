# MoonPay

MoonPay is a full-stack app for **professors to reward students** with classroom currency (MoonBucks): React + Vite frontend and Node/Express backend with MongoDB.

- **Frontend** — Professor dashboard (award MoonBucks, manage students, marketplace) and student portal (balances, marketplace, redemption).
- **Backend** — REST API with JWT auth, classes, transactions, and listings.

## Project structure

- `/` — React + Vite frontend (this is the app you see in the browser)
- `/backend` — Node.js + Express API (auth, classes, transactions, MongoDB)

## Quick start

**1. Backend** (Terminal 1)

```bash
cd backend
npm install
npm start
```

Backend runs at http://localhost:5005. Ensure MongoDB is running and `backend/.env` is configured (see `backend/README.md`).

**2. Frontend** (Terminal 2)

```bash
npm install
npm run dev
```

Frontend runs at http://localhost:5173 and talks to the backend API.

For backend setup (MongoDB, `.env`), see `backend/README.md`.

## Adding users (demo or real)

With a fresh database there are no accounts. To add users:

1. **Sign up in the app** — Open http://localhost:5173, click "Create Account", and register. New accounts get a starting MoonBucks balance. Repeat to create more users (e.g. one professor, one student).
2. **Create a class** — Log in as the user who will be the professor, go to Classes, and "Create a Class" (e.g. "Intro to MoonPay"). Share the class code with students.
3. **Join the class** — Log in as another user, go to Classes, enter the code, and "Join Class".

No seed data or demo logins are included; all users and classes are created through the app.

## Features
- Login for professors and students
- Professor dashboard with class management and reward tools
- Student balance display and marketplace
- Redemption workflow
- Secure API communication using JWTs


## Tech Stack
- **React (Vite)**
- **TypeScript** (optional, remove this line if not using it)
- **React Router**
- **CSS Modules** (whichever you are using)


## Installation

Make sure you have **Node.js ≥ 18** installed.

npm install
