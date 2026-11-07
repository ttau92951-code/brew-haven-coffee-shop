# ☕ Brew Haven — Coffee Shop Management System

A complete, full-stack coffee shop management platform built for the **Coffee Shop Management Web Application** group assignment.

Brew Haven is a modern storefront **and** a staff management dashboard. Customers browse the menu, place orders and track their status; staff manage menu items, process orders and monitor sales performance. All data is persisted in a key-value NoSQL database (Redis via Upstash).

---

## Table of contents

- [Project description](#project-description)
- [Technologies used](#technologies-used)
- [Application features](#application-features)
- [Project structure](#project-structure)
- [Installation instructions](#installation-instructions)
- [Environment variables required](#environment-variables-required)
- [API documentation](#api-documentation)
- [Testing instructions](#testing-instructions)
- [Deployment information](#deployment-information)
- [Security notes](#security-notes)

---

## Project description

A local coffee shop wants to modernise its operations. Today, staff record orders by hand, which makes it difficult to track orders, update prices and know which orders have been completed.

Brew Haven solves this with a cloud-hosted web application:

| Role | What they can do |
| --- | --- |
| **Customer** | Browse the menu, filter and search products, manage a shopping cart, place an order, receive a unique order number, create an account, track order history, receive notifications when an order is ready, and write reviews, compliments or complaints. |
| **Staff** | Sign in to a protected dashboard, add/edit/delete menu items, mark items unavailable, process orders through their lifecycle, read and reply to customer feedback, and review daily/weekly/monthly sales reports and customer records. |

The system follows a three-tier architecture:

```
React (Vercel / Netlify)
        │  Fetch API + JWT
        ▼
Express.js REST API (Render)
        │  @upstash/redis
        ▼
Key-Value NoSQL Database (Upstash Redis)
   menu records · customer orders · customer accounts · notifications · customer feedback
```

---

## Technologies used

**Frontend**
- React 19 (Vite)
- React Router v7 (client-side routing)
- Fetch API (custom `api` client in `frontend/src/api/client.js`)
- CSS3 design system (custom properties, responsive grids, animations)
- React Context for authentication and cart state

**Backend**
- Node.js + Express.js (ES modules)
- JSON Web Tokens (`jsonwebtoken`) for authentication
- `bcryptjs` password hashing (12 salt rounds)
- `cors` for origin control
- `dotenv` for environment configuration

**Database**
- Redis (key-value NoSQL) via **Upstash**, accessed over HTTPS with `@upstash/redis`
- JSON documents stored under unique keys

**Tooling & hosting**
- Git + GitHub for version control
- Vercel / Netlify for the frontend
- Render for the backend API
- Upstash for the managed Redis database

---

## Application features

### Customer storefront
- **Home** — hero section with an administrator-configurable background image, featured products, popular categories, about section, live customer reviews, opening hours, contact details and footer.
- **Navigation bar** — Home, Our Menu, About Us, Contact, My Orders, Login/Sign Up and Shopping Cart with a live cart count, active-page highlighting, an account menu and a responsive mobile menu.
- **Menu** — product cards with image, name, category, description, price in Maloti (M) and an availability badge; category filters, keyword search, sorting and clear unavailable states.
- **Shopping cart** — a slide-out cart drawer and a full cart page; increase/decrease quantities, remove items, see individual prices and the total.
- **Checkout** — customer name, contact number, optional email and order notes, with client-side validation and a live order summary.
- **Order confirmation** — unique order number, full order summary, total and current status.
- **Customer account** — sign up, log in (show/hide password, remember me), update profile and password, view order history, track live order statuses and log out.
- **Order tracking** — a status timeline (Pending → Preparing → Ready → Collected) on every order.
- **Notifications** — a bell in the navigation bar with a live unread badge; customers are alerted when an order is received, being prepared, **ready for collection** and collected, and whenever staff reply to their feedback.
- **Reviews & feedback** — customers can write a review (1–5 stars), a compliment or a complaint, optionally link it to an order, and read the staff reply in their own history. Top-rated reviews (4★ and above) are shown in the "What our customers say" section on the home page.

### Staff dashboard
- **Secure staff login** — separate portal, JWT-based session and role-based access control. Employees sign in with the work email and password an administrator assigned to them.
- **Overview** — KPI cards for total orders, today's orders, today's revenue, average order value, menu items, customers and each order status; a 7-day revenue chart, best-seller ranking and a recent-orders table.
- **Menu management** — add, edit and delete menu items; change price, description, category and availability; upload an image (automatically resized and compressed in the browser) or use an image URL.
- **Order management** — search, filter and sort all orders; view full order details; advance the status with one click or choose a status directly.
- **Sales & reports** — daily, weekly and monthly revenue and order volumes, total revenue, average order value, best-selling products and a per-period breakdown table. **All figures are calculated from real stored orders**, never hardcoded.
- **Customer management** — search registered customers, view their contact details, order counts and total spend, inspect full order history and remove accounts.
- **Customer feedback** — a live badge shows how many new messages are waiting; staff can search and filter reviews, compliments and complaints, see the average rating, change the status (New → Read → Resolved) and reply to the customer, which notifies them.
- **Employee management** *(administrators only)* — add employees with a name, work email and assigned password, edit their details, reassign a password, activate/deactivate an account and remove employees. What you assign here is exactly what the employee uses to sign in.
- **Store settings** — set the background image for the home page hero by pasting an image URL or uploading a file (resized and compressed in the browser), with a live preview and a one-click reset to the default.

---

## Project structure

```
CoffeShopManagementSystem/
├── backend/
│   ├── config/
│   │   ├── constants.js          # Redis keys, roles, order statuses, categories
│   │   └── redis.js              # Upstash client + pingRedis()
│   ├── controllers/              # auth, menu, order, customer, report, notification, feedback, employee, settings logic
│   ├── data/
│   │   ├── seedMenu.js           # Seed menu (14 items across 5 categories)
│   │   └── store.js              # Read/write helpers for each Redis collection
│   ├── middleware/
│   │   ├── authMiddleware.js     # authenticate, optionalAuthenticate, authorize
│   │   └── errorHandler.js       # 404 + centralised error responses
│   ├── routes/                   # auth, menu, order, customer, report, notification, feedback, employee, settings routers
│   ├── utils/                    # ids, dates, validation and notification helpers
│   ├── hashPassword.js           # CLI: generate a bcrypt hash for staff password
│   ├── testlogin.js              # CLI: test the staff login endpoint
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express app entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/client.js         # Fetch wrapper (JSON + Bearer token)
│   │   ├── components/           # Navbar, Footer, CartDrawer, ProductCard, Modal…
│   │   ├── context/              # AuthContext, CartContext, NotificationsContext
│   │   ├── hooks/useAsync.js     # Data-fetching helper
│   │   ├── pages/                # Customer pages
│   │   │   └── staff/            # Staff dashboard pages
│   │   ├── styles/               # theme.css, layout.css, pages.css (design system)
│   │   ├── utils/                # currency/date formatting, image helpers
│   │   ├── App.jsx               # Router + protected routes
│   │   └── main.jsx              # Providers + entry point
│   ├── .env.example
│   ├── netlify.toml
│   ├── vercel.json
│   └── package.json
│
└── render.yaml                   # Render blueprint for the backend
```

---

## Installation instructions

### Prerequisites
- Node.js 18 or newer (Node 20+ recommended)
- npm
- A free [Upstash](https://upstash.com) Redis database (REST credentials)

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/coffeshop-management-system.git
cd coffeshop-management-system
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env` (see [Environment variables required](#environment-variables-required)), then generate a staff password hash:

```bash
node hashPassword.js
```

Paste the generated hash into `STAFF_PASSWORD_HASH`, then start the API:

```bash
npm run dev     # Node --watch
# or
npm start
```

The API runs at `http://localhost:5000`. Verify it with `http://localhost:5000/api/health`.

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

The storefront opens at `http://localhost:5173` (Vite picks the next free port if it is busy).

---

## Environment variables required

### `backend/.env`

| Variable | Description | Example |
| --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | `https://your-db.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | `AX...` |
| `STAFF_USERNAME` | Username of the bootstrap administrator account (also signs in at the staff portal) | `admin` |
| `STAFF_PASSWORD_HASH` | bcrypt hash of the administrator password (generate with `node hashPassword.js`) | `$2a$12$...` |
| `JWT_SECRET` | Long random string used to sign JWTs | `a-very-long-random-secret` |
| `PORT` | Port the API listens on (optional, defaults to `5000`) | `5000` |
| `FRONTEND_URL` | Deployed frontend origin, used for CORS (optional in development) | `https://brew-haven.vercel.app` |

### `frontend/.env`

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

> ⚠️ **Never commit `.env` files.** Both `.env` files are git-ignored. No secrets are ever exposed to the frontend — only `VITE_API_URL` is embedded in the client bundle.

---

## API documentation

Base URL (development): `http://localhost:5000/api`

All responses are JSON and follow a consistent shape:

```json
{ "success": true, "message": "…", "data": { } }
```

Errors return `{ "success": false, "message": "…" }` with a matching HTTP status code.

| 🔒 | Meaning |
| --- | --- |
| — | Public |
| 🔑 | Requires a valid JWT (`Authorization: Bearer <token>`) |
| 👤 | Customer role required |
| 🧑‍🍳 | Staff role required |
| 🛠️ | Administrator role required |

Administrators have access to every staff endpoint; the employee-management endpoints are the only ones limited to administrators.

### Authentication

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | — | Register a new customer (`fullName`, `email`, `phone`, `password`, `confirmPassword`) |
| `POST` | `/auth/login` | — | Customer login (`email`, `password`) |
| `POST` | `/auth/staff/login` | — | Staff/administrator login with the assigned work email (`email`, `password`); the bootstrap administrator may also sign in with its `username` |
| `GET` | `/auth/me` | 🔑 | Return the signed-in user's profile |

### Menu

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/menu` | — | Retrieve all menu items |
| `GET` | `/menu/:id` | — | Retrieve one menu item |
| `POST` | `/menu` | 🧑‍🍳 | Add a menu item |
| `PUT` | `/menu/:id` | 🧑‍🍳 | Update a menu item |
| `DELETE` | `/menu/:id` | 🧑‍🍳 | Delete a menu item |

### Orders

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/orders` | — / 🔑 | Place an order (guests allowed; linked to the account when signed in) |
| `GET` | `/orders` | 🧑‍🍳 | Retrieve all customer orders |
| `GET` | `/orders/:id` | 🔑 | Retrieve a specific order (staff, or the customer who placed it) |
| `PATCH` | `/orders/:id/status` | 🧑‍🍳 | Update order status (`Pending`, `Preparing`, `Ready`, `Collected`) |

### Customer

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/customers/me` | 👤 | View my profile |
| `PUT` | `/customers/me` | 👤 | Update my profile / change password |
| `GET` | `/customers/me/orders` | 👤 | View my order history |
| `GET` | `/customers` | 🧑‍🍳 | List all customers with spend totals |
| `GET` | `/customers/:id` | 🧑‍🍳 | View one customer |
| `GET` | `/customers/:id/orders` | 🧑‍🍳 | View one customer's order history |
| `DELETE` | `/customers/:id` | 🧑‍🍳 | Remove a customer account |

### Notifications

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/notifications` | 👤 | List my notifications (newest first) with `count` and `unreadCount` |
| `PATCH` | `/notifications/:id/read` | 👤 | Mark one of my notifications as read |
| `PATCH` | `/notifications/read-all` | 👤 | Mark all my notifications as read |

Notifications are created automatically when an order's status changes (`order_update`) and when staff reply to feedback (`feedback_reply`).

### Feedback

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/feedback` | — / 🔑 | Submit a review, compliment or complaint (guests allowed; `rating` 1–5 required for reviews) |
| `GET` | `/feedback/public` | — | Top customer reviews (rating ≥ 4) for the home page — `limit` optional (1–12, default 6) |
| `GET` | `/feedback/me` | 👤 | List my own submissions, including any staff reply |
| `GET` | `/feedback` | 🧑‍🍳 | List all customer feedback with a summary; filter by `type`, `status` or `search` |
| `PATCH` | `/feedback/:id` | 🧑‍🍳 | Update feedback status (`New`, `Read`, `Resolved`) |
| `POST` | `/feedback/:id/reply` | 🧑‍🍳 | Reply to a customer message (notifies the customer when signed in) |

### Employees

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/employees` | 🛠️ | List all employees |
| `POST` | `/employees` | 🛠️ | Add an employee (`fullName`, `email`, `phone`, `position`, `password`) — the assigned work email and password are their login |
| `PUT` | `/employees/:id` | 🛠️ | Update an employee, reassign a password or activate/deactivate the account |
| `DELETE` | `/employees/:id` | 🛠️ | Remove an employee |

### Store settings

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/settings` | — | Read the storefront settings (the home page hero background image) |
| `PUT` | `/settings` | 🧑‍🍳 | Set or clear the hero background image (`heroImage` as an image URL or uploaded data URL) |

### Reports

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/reports/overview` | 🧑‍🍳 | Totals, today's figures, status counts, revenue and best sellers |
| `GET` | `/reports/daily?days=7` | 🧑‍🍳 | Daily sales for the last *N* days (1–31) |
| `GET` | `/reports/weekly?weeks=6` | 🧑‍🍳 | Weekly sales for the last *N* weeks (1–12) |
| `GET` | `/reports/monthly?months=6` | 🧑‍🍳 | Monthly sales for the last *N* months (1–24) |

### System

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | — | Health check — reports API and database status |

<details>
<summary>Example — placing an order</summary>

**Request**

```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "customerName": "Jane Smith",
  "phone": "+266 5800 0000",
  "email": "jane@example.com",
  "notes": "Extra hot, oat milk",
  "items": [
    { "menuItemId": "menu-caramel-latte", "quantity": 2 },
    { "menuItemId": "menu-butter-croissant", "quantity": 1 }
  ]
}
```

**Response — `201 Created`**

```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id": "6f1c…",
    "orderNumber": "BH-M3K9X-4A2F",
    "customerName": "Jane Smith",
    "items": [
      { "menuItemId": "menu-caramel-latte", "name": "Caramel Latte", "price": 45, "quantity": 2, "subtotal": 90 }
    ],
    "total": 122,
    "status": "Pending",
    "statusHistory": [{ "status": "Pending", "at": "2026-11-05T09:15:00.000Z" }],
    "createdAt": "2026-11-05T09:15:00.000Z"
  }
}
```

</details>

---

## Testing instructions

### 1. Health check

```bash
curl http://localhost:5000/api/health
```

Expected: `{"success":true,"database":"connected",...}`. A `503` means the API is up but Redis is unreachable — check your Upstash credentials.

### 2. Staff login helper

```bash
cd backend
node testlogin.js
```

Enter the staff username and password to confirm the credentials in `.env` are valid.

### 3. Manual test checklist

**Customer flows**
1. Open the storefront and confirm the menu loads with prices in Maloti (M).
2. Filter by category, search for a product and change the sort order.
3. Add items to the cart, change quantities and remove an item.
4. Check out as a guest — confirm validation messages appear for missing/invalid fields.
5. Confirm the order confirmation page shows a unique order number and the correct total.
6. Register a new account and confirm you are signed in automatically.
7. Place an order while signed in and confirm it appears under **My Orders**.
8. Try registering with an existing email — expect a clear "already exists" error.
9. Log out and confirm protected pages redirect to the login screen.
10. Confirm the notification bell shows an unread badge, open **Notifications** and check the "Order received" alert is listed; open it and confirm the badge count drops.
11. Open **Reviews & Feedback**, submit a review with a star rating, and confirm it appears in your list with a "Sent" status.
12. On the home page, confirm the "What our customers say" section shows real customer reviews (those rated 4★ and above) and that the hero banner uses the background image set by staff.

**Staff flows**
1. Visit `/staff/login` and sign in with the credentials from `.env`.
2. Confirm a customer account cannot reach `/staff` (it is redirected).
3. On **Overview**, verify KPI figures match the orders in the system.
4. Add a menu item, edit its price, toggle availability, then delete it.
5. Upload a product image and confirm it appears on the storefront.
6. In **Order Management**, advance an order through Pending → Preparing → Ready → Collected and confirm the customer sees the new status.
7. In **Sales & Reports**, switch between Daily/Weekly/Monthly and confirm the figures update.
8. In **Customers**, search for a customer and open their order history.
9. Move an order to **Ready** and confirm the customer's notification bell increments with an "order is ready" alert.
10. In **Customer Feedback**, confirm the sidebar badge shows the number of new messages, open a review and send a reply — confirm the status changes and the customer receives a notification.
11. In **Employees** (administrator only), add an employee with a work email and password, then log out and sign in at `/staff/login` with those exact details. Confirm the account reaches the dashboard, and that a non-administrator employee does not see the **Employees** section.
12. In **Store Settings**, paste an image URL or upload a file, save, and refresh the home page to confirm the hero banner changed; use **Use default** to restore the built-in image.

**Data & security**
1. Restart the backend (`Ctrl+C`, then `npm start`) and confirm menu items and orders are still present — this proves Redis persistence.
2. Call a staff-only endpoint without a token and confirm a `401` response.
3. Call a staff-only endpoint with a customer token and confirm a `403` response.
4. Confirm no response ever contains `passwordHash`.

---

## Deployment information

### 1. Database — Upstash Redis

1. Create a free Redis database at [upstash.com](https://upstash.com).
2. Enable **persistence** in the database settings.
3. Copy the **REST URL** and **REST TOKEN** — these become `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### 2. Backend — Render

1. Push the repository to GitHub.
2. On Render, create a **New Web Service** from the repository (or use the included `render.yaml` blueprint).
3. Settings:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Health check path:** `/api/health`
4. Add the environment variables: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `STAFF_USERNAME`, `STAFF_PASSWORD_HASH`, `JWT_SECRET`, and `FRONTEND_URL` (your deployed frontend URL).
5. Deploy and confirm `https://<your-service>.onrender.com/api/health` returns `database: "connected"`.

### 3. Frontend — Vercel or Netlify

**Vercel**
1. Import the repository and set **Root Directory** to `frontend`.
2. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
3. Add the environment variable `VITE_API_URL = https://<your-service>.onrender.com/api`.
4. Deploy. The included `vercel.json` rewrites all routes to `index.html` so client-side routing works on refresh.

**Netlify**
1. Create a new site from the repository; base directory `frontend`.
2. Build command `npm run build`, publish directory `dist`.
3. Add `VITE_API_URL` under **Site settings → Environment variables**.
4. Deploy. The included `netlify.toml` provides the SPA redirect rule.

> After deploying the frontend, update `FRONTEND_URL` on Render so the backend CORS configuration accepts your production origin.

---

## Security notes

- Passwords are hashed with **bcrypt** (12 salt rounds). Plain-text passwords are never stored, logged or returned.
- Authentication uses **JWT** (`Authorization: Bearer <token>`), with tokens expiring after 8 hours.
- **Role-based access control** protects staff routes (`authorize('staff')`) and customer routes (`authorize('customer')`).
- Customers can only read their own profile and orders; ownership is checked server-side.
- All incoming request bodies are validated on the backend before anything is written to Redis.
- Errors return consistent JSON with meaningful HTTP status codes, and internal details are never leaked.
- CORS is restricted to the configured frontend origin plus local development ports.
- Secrets live in environment variables only — nothing sensitive is bundled into the frontend.

---

## Contributors

This project was completed as a group assignment. Each member contributed across research, development and testing — see the repository commit history for individual contributions.
