# Gaya ji Shopping mart - Deep Codebase & Architecture Analysis

Gaya ji Shopping mart is a premium, light-themed consumer utilities and personal care e-commerce application. It is architected with a decoupled frontend (React + Vite) and backend (Node.js + Express), featuring integrations for payments (Razorpay), notifications (Nodemailer, Twilio), and database persistence.

---

## 1. Directory Structure

```
d:/RanjanCyberCafe/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Shared UI parts (Header, Footer, ProductCard, ProtectedRoute)
│   │   ├── context/            # Global states (Currency, Toast, Wishlist)
│   │   ├── config/             # Configuration (API_URL endpoint definition)
│   │   ├── pages/              # Main view screens (Home, Cart, Checkout, Profile, Admin)
│   │   ├── App.jsx             # Main App Router & layout wrapper
│   │   └── index.css           # Global custom stylesheets & HSL visual tokens
│   └── package.json            # React & Vite build configurations
├── server/                     # Backend API (Node.js + Express)
│   ├── data/                   # Local database (db.json)
│   ├── routes/                 # Express API Endpoint routers
│   ├── utils/                  # Helper classes (storage.js file loader)
│   ├── firebaseAdmin.js        # Dual-mode Firebase / Local Mock Firestore engine
│   ├── index.js                # Main Express server bootstrapper
│   └── package.json            # Express server dependencies
└── render.yaml                 # Render.com Infrastructure-as-Code deployer
```

---

## 2. Core Functional Components

### A. Frontend Design & Pages (`client/`)
*   **Aesthetic Theme**: Styled with a highly immersive, clean light-themed UI. The UI is built using custom CSS variables (`index.css`), smooth keyframe animations, glassmorphism cards, and shadow effects.
*   **Product Catalog (`pages/Home.jsx`)**: Implements client-side dynamic search, category filters, real-time sorting (price, date, rating), a maximum price range slider, and a custom Flash Sale timer.
*   **Cart & Checkout (`pages/Cart.jsx` & `pages/Checkout.jsx`)**: Handles client-side order composition, shipping entry, and routes orders through COD or Online payment methods.
*   **Admin Dashboard (`pages/Admin/`)**: Allows full catalog management (CRUD operations on products via `/admin/add` and `/admin/edit/:id`) and order tracking / status updating.
*   **Security Shell (`components/ProtectedRoute.jsx`)**: Guards administrative routes against unauthenticated access.
*   **Global Contexts (`context/`)**:
    *   `CurrencyContext`: Centralized pricing formatting (defaulting to ₹/INR).
    *   `ToastContext`: Floating real-time message popups for user actions.
    *   `WishlistContext`: Handles favorited products in localStorage.

### B. Backend API & Engine (`server/`)
*   **Server Core (`index.js`)**: Configures Express middleware (CORS, JSON parsers, public static uploads), and binds modular routers to respective route prefixes.
*   **Authentication (`routes/authRoutes.js`)**: Formulates registration and sign-in routes with hardcoded administration fallback emails.
*   **Payments (`routes/paymentRoutes.js`)**:
    *   Integrates Razorpay orders.
    *   Enforces server-side price validation by retrieving catalog data from the database, protecting against pricing exploits.
    *   Verifies Razorpay payment signatures using HMAC SHA256 crypto hashes.
*   **Marketing Alert Suite (`routes/marketingRoutes.js`)**:
    *   Stores newsletter subscriptions.
    *   Manages product restock and price drop waitlists.
    *   Fires catalog-wide alert triggers to notify users.
    *   Supports dynamic customer review submissions.
*   **Notification Dispatch (`routes/notifyRoutes.js`)**:
    *   Sends emails to the administrator on orders, customer inquiries, and return requests via Nodemailer.
    *   Sends automated SMS tracking links via Twilio.
    *   Implements **Fraud Detection**: Compares calculated db product pricing with submitted totals; flags the admin email subject line with `⚠️ [FRAUD DETECTION]` if a price exploit is detected.

---

## 3. Database Strategy: Seamless Dual-Mode Architecture

The project is configured to support **Firebase Firestore** as its main cloud database. However, to simplify local development and avoid mandatory cloud hosting setups, the backend contains a **Local Mock Firestore Database Fallback**:

```
[Start Node Server]
        │
        ▼
{Valid Firebase Keys?}
   ├── Yes ──► [Initialize real Firebase SDK] ──► [Connects to Cloud Firestore]
   └── No  ──► [Activate Mock Firestore client] ──► [Reads/Writes to server/data/db.json locally]
```

### Mock Firestore Mechanism
The mock client mirrors standard Firebase Firestore behaviors by implementing the following matching chain:
1.  **Collection References**: Returns collection wrappers supporting `.doc(id)`, `.add(data)`, `.where(field, op, val)`, and `.orderBy(field, dir)`.
2.  **Document References**: Implements `.get()`, `.set(data, { merge: true })`, `.update(data)`, and `.delete()`.
3.  **Batch Operations**: Mirrors `db.batch()` to write sets of documents sequentially.
4.  **Query Operators**: Supports `==` and `in` filters (including `__name__` / `id` checks) and orders document lists dynamically.
5.  **Local Persistence**: Seamlessly maps all actions onto the local file-based database (`server/data/db.json`) via `server/utils/storage.js`.

---

## 4. Environment Parameters

To ensure correct deployments in production, the following variables must be configured:

### Backend Environments (`server/.env`)
*   `PORT`: Port for the API server (default `5000`).
*   `NODE_ENV`: Runs in `development` or `production`.
*   `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Live Keys from Razorpay.
*   `ADMIN_EMAIL` & `SMTP_PASS`: Admin email and Gmail App Password for SMTP alerts.
*   `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, & `TWILIO_PHONE`: Twilio account variables for SMS alerts.
*   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, & `FIREBASE_PRIVATE_KEY`: Service account details for cloud storage.

### Client Environments (`client/.env`)
*   `VITE_API_URL`: Address of the Express API server (e.g. `http://localhost:5000`).
*   `VITE_RAZORPAY_KEY_ID`: Client public Razorpay key.
