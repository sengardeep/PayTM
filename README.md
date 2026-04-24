# PayTM Clone

A full-stack wallet application built with React, Node.js, Express, and MongoDB.

Users can:

- Create an account
- Sign in securely
- View wallet balance
- Search other users
- Transfer money to other users

## Features

- JWT-based authentication
- Protected frontend routes
- Atomic money transfer using MongoDB transactions
- User search with filter support
- Backend request validation with Zod
- Password hashing with bcrypt

## Tech Stack

Frontend:

- React
- Vite
- React Router

Backend:

- Node.js
- Express
- MongoDB with Mongoose
- Zod
- bcrypt
- JSON Web Token

## Project Structure

```text
PayTM/
  backend/
    auth/
    routes/
    utils/
    config.js
    db.js
    index.js
  frontend/
    src/
      lib/
      App.jsx
      Signin.jsx
      Signup.jsx
      Dashboard.jsx
      SendMoney.jsx
    vite.config.js
```

## Prerequisites

- Node.js 20 or newer (Vite 8 works best with Node 20.19+)
- npm
- MongoDB Atlas or a local MongoDB replica set

Important: This app uses MongoDB transactions for signup and transfers. Transactions require a replica set.

## Environment Variables

Create a file named .env inside backend using backend/.env.example.

Required variables:

| Variable | Description | Example |
| --- | --- | --- |
| MONGODB_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/paytmdb |
| JWT_SECRET | Secret key used to sign JWT tokens | replace-with-a-long-random-secret |
| PORT | Backend port | 3000 |

## Local Setup

### 1. Start Backend

Bash:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

PowerShell:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Backend default URL: http://localhost:3000

### 2. Start Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: http://localhost:5173

## Frontend and Backend Connection

- Backend API base path is /api/v1
- Frontend sends requests to /api/v1 using a shared API helper
- Vite dev proxy forwards /api requests to http://localhost:3000
- JWT token is stored in localStorage under:
  - paytm_token
  - paytm_display_name
- Authenticated requests send Authorization header:

```text
Authorization: Bearer <token>
```

## Frontend Routes

- /signin
- /signup
- /dashboard
- /send?to=<userId>&name=<encodedName>

## API Reference

Base path:

```text
/api/v1
```

### Auth

POST /user/signup

Request body:

```json
{
  "username": "johndoe",
  "password": "secret123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:

```json
{
  "message": "User created successfully",
  "token": "<jwt>"
}
```

POST /user/signin

Request body:

```json
{
  "username": "johndoe",
  "password": "secret123"
}
```

Response:

```json
{
  "message": "Signin successful",
  "token": "<jwt>"
}
```

### Users

GET /user/bulk?filter=<name>

- Auth required
- Returns matching users by first or last name

Sample response:

```json
{
  "user": [
    {
      "username": "janedoe",
      "firstName": "Jane",
      "lastName": "Doe",
      "_id": "..."
    }
  ]
}
```

PUT /user

- Auth required
- Updates password, firstName, or lastName

### Account

GET /account/balance

- Auth required

Sample response:

```json
{
  "balance": 4500
}
```

POST /account/transfer

- Auth required
- Transfers amount from logged-in user to target user

Request body:

```json
{
  "to": "<targetUserId>",
  "amount": 500
}
```

Response:

```json
{
  "message": "Transfer successful"
}
```

## Scripts

Backend:

- npm run start
- npm run dev

Frontend:

- npm run dev
- npm run build
- npm run lint
- npm run preview

## Troubleshooting

- Error: JWT_SECRET is not set
  - Ensure backend/.env exists and contains JWT_SECRET

- Transfer fails even with valid data
  - Confirm MongoDB supports transactions (replica set or Atlas)

- 401 Unauthorized on protected endpoints
  - Ensure frontend has a valid JWT token and sends Authorization: Bearer <token>

- Frontend cannot reach backend
  - Confirm backend is running on port 3000
  - Confirm frontend runs through Vite dev server with proxy enabled

## License

ISC