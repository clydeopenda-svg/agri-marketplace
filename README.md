# Agri Marketplace

A full-stack farmer-to-buyer produce marketplace. Farmers list produce directly; buyers browse and order without a middleman.

## Tech Stack

**Backend:** Flask, PostgreSQL, SQLAlchemy, Flask-Migrate (Alembic), Flask-JWT-Extended, Marshmallow, Flask-RESTful, Flask-CORS

**Frontend:** React (Vite), React Router

## Features

- JWT-based authentication (register, login, token refresh)
- Two user roles: **farmer** and **buyer**, with role-based access control
- Farmers can create, view, and manage produce listings
- Buyers can browse, filter by category, and place orders
- Farmers can view incoming orders and update status (confirm / deliver / cancel)
- Buyers can view their order history and cancel pending orders
- Responsive design with a rotating photo hero and a "How It Works" section for new visitors

## Project Structure

## Local Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agri_marketplace"
export FLASK_APP=main.py

# create the database first (if it doesn't exist)
sudo -u postgres createdb agri_marketplace

flask db upgrade
python main.py
```

Backend runs at `http://127.0.0.1:5000`.

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment Variables

**Backend** (`.env` or exported):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET_KEY` — secret for signing JWTs
- `SECRET_KEY` — Flask secret key

**Frontend**:
- `VITE_API_URL` — base URL of the backend API (defaults to `http://localhost:5000/api` for local dev)

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Create a new user (farmer or buyer) |
| POST | `/api/login` | Log in, receive access + refresh tokens |
| POST | `/api/refresh` | Refresh an expired access token |
| GET | `/api/produce` | List produce (supports category filter) |
| POST | `/api/produce` | Create a produce listing (farmer only) |
| GET | `/api/orders` | List orders (buyer sees own orders, farmer sees orders on their produce) |
| POST | `/api/orders` | Place an order (buyer only) |
| PATCH | `/api/orders/<id>` | Update order status |

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Farmer | farmer@example.com | password123 |

*(Create additional buyer/farmer accounts via the Register page.)*

## Known Limitations

- No payment integration (orders are tracked but not paid for in-app)
- No image upload; produce images are set via URL
- Free-tier hosting (if deployed on Render) means the backend may spin down after inactivity and the database may expire after 30 days
