# Parin Studio Store

![Parin Studio hero](frontend/public/images/hero-section.jpg)

Parin Studio Store is a full-stack e-commerce demo for a nature-inspired stationery brand. It combines a calm, responsive storefront with customer accounts, shopping and checkout flows, product reviews, and an admin area for managing the catalogue and site content.

## Highlights

- Responsive storefront with search, pagination, product details, stock status, and reviews
- Cart, shipping, payment selection, checkout, and order history flows
- Email/password authentication, Google OAuth support, email verification, and password reset
- PayPal sandbox and Stripe test checkout integrations
- Customer profile and order management
- Admin tools for products, users, orders, image uploads, and homepage settings
- JWT authentication stored in an HTTP-only cookie
- MongoDB-backed REST API

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, React Router, Redux Toolkit, RTK Query, React Bootstrap |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Authentication | JWT, bcrypt, Google OAuth |
| Payments | PayPal Sandbox, Stripe Test Mode |
| Email | Nodemailer / SMTP |

## Project structure

```text
backend/                 Express API, models, controllers, and middleware
frontend/                React application
uploads/                 Local development uploads (ignored by Git)
example.env              Environment variable template
package.json             Root scripts for running both applications
```

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm
- A MongoDB connection string

### Setup

```bash
git clone https://github.com/Song-Siwattanasombat/parin-studio-store.git
cd parin-studio-store
npm install
npm install --prefix frontend
```

Copy `example.env` to `.env`, then provide at least `MONGO_URI` and `JWT_SECRET`. Payment, Google OAuth, and SMTP variables are optional unless you want to test those integrations.

For the optional Google sign-in button, also create `frontend/.env.local`:

```env
REACT_APP_GOOGLE_CLIENT_ID=ADD_YOUR_GOOGLE_OAUTH_CLIENT_ID
```

Start the API and React development server together:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:5000

To create a production build:

```bash
npm run build
npm start
```

The Express server serves the built frontend at http://localhost:5000.

## Deploy to Vercel

Import this repository into Vercel twice:

1. **API project:** keep the Root Directory at the repository root. Add the server variables from `example.env`.
2. **Frontend project:** set the Root Directory to `frontend`. Add `REACT_APP_API_URL` with the API project's URL and optionally add `REACT_APP_GOOGLE_CLIENT_ID`.

Set `CLIENT_URL` on the API project to the frontend project's production URL and set `API_URL` to the API project's own production URL. Redeploy both projects after changing environment variables.

The local `uploads/` directory is not persistent on Vercel. Existing catalogue images work, but admin uploads should use an external image service before relying on them in production.

## Environment variables

Use [example.env](example.env) as the complete template. Do not commit `.env` or production credentials.

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs authentication tokens |
| `CLIENT_URL` / `API_URL` | URLs used in email and checkout callbacks |
| `GOOGLE_CLIENT_ID` | Verifies Google sign-in tokens on the API |
| `PAYPAL_*` | PayPal sandbox checkout |
| `STRIPE_*` | Stripe test checkout |
| `EMAIL_*` | SMTP email delivery |

## Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the API and frontend in development mode |
| `npm run server` | Run only the API with Nodemon |
| `npm run client` | Run only the React frontend |
| `npm run build` | Install dependencies and build the frontend |
| `npm run data:import` | Seed the database with demo products and users |
| `npm run data:destroy` | Remove seeded data |

## Portfolio notes

This project demonstrates end-to-end ownership of a MERN application: data modelling, REST API design, authentication and authorization, third-party checkout flows, responsive UI work, and deployment-oriented configuration.

All payment integrations are configured for sandbox/test use. Product, shipping, and order information in the repository is demonstration data.
