# Gaya ji Shopping mart - Customer Handover Guide

Welcome to your new e-commerce platform, **Gaya ji Shopping mart**! This document contains all the instructions you need to run, manage, and deploy your website.

---

## 📖 Key Documentation Files

For a complete business and technical deep dive, please review the following files in the project root:
1.  **[DEEP_ANALYSIS.md](file:///d:/RanjanCyberCafe/DEEP_ANALYSIS.md)**: A detailed technical breakdown of the architecture, directory structure, payment logic, and local-first database strategies.
2.  **[BUSINESS_ROADMAP.md](file:///d:/RanjanCyberCafe/BUSINESS_ROADMAP.md)**: A comprehensive guide outlining team roles, operations workflow, backend/frontend hosting strategies, and Meta/Google Ads plans.

---

## 1. Project Structure
-   **client/**: The frontend website (React + Vite). This is what customers see.
-   **server/**: The backend API (Node.js + Express). This handles data, orders, and payments.

## 2. Running Locally (For Development)

### Prerequisites
-   Install [Node.js (LTS Version)](https://nodejs.org/).

### Step A: Start the Backend
1.  Open a terminal in the `server` folder.
2.  Install dependencies: `npm install`
3.  Start the server: `npm start`
    -   It runs on `http://localhost:5000`.
    -   Data is saved in `server/data/db.json`.

### Step B: Start the Frontend
1.  Open a new terminal in the `client` folder.
2.  Install dependencies: `npm install`
3.  Start the website: `npm run dev`
    -   It runs on `http://localhost:5173`.

## 3. Deployment Instructions

### Backend (Render.com)
1.  Push this entire code to a **GitHub Repository**.
2.  Sign up on [Render.com](https://render.com).
3.  Create a **New Web Service**.
4.  Set build configuration:
    -   **Root Directory**: `server`
    -   **Build Command**: `npm install`
    -   **Start Command**: `node index.js`
5.  **Environment Variables**:
    -   `RAZORPAY_KEY_ID`: Your Key ID
    -   `RAZORPAY_KEY_SECRET`: Your Key Secret
    -   `SMTP_PASS`: Your Gmail App Password (for email alerts)
    -   `ADMIN_EMAIL`: Your support email (default: `shoppingmartgayaji@gmail.com`)
6.  **Persistence**:
    -   By default, data resets on restart. To fix this, add a **Disk** in Render settings mounted to `/opt/render/project/src/server/data`.

### Frontend (Netlify / Vercel / Cloudflare Pages)
1.  Sign up on [Netlify](https://netlify.com), [Vercel](https://vercel.com), or Cloudflare.
2.  Import your GitHub Repository.
3.  Set build configuration:
    -   **Root Directory**: `client`
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist`
4.  **Environment Variables**:
    -   `VITE_API_URL`: **[YOUR_RENDER_BACKEND_URL]** (e.g., `https://gaya-ji-mart-backend.onrender.com`)

## 4. Admin Access
-   Go to `/login` to access the admin panel.
-   Current logic is open for demo; you can sign in with administrative access.

## 5. Maintenance & Updates (Best Practices)

### How to Change Domains
-   **Frontend**: If you buy a custom domain (e.g., `www.gayajimart.com`), add it in your Netlify/Vercel/Cloudflare dashboard under "Domain Management".
-   **Backend**: If you move your backend, just update the `VITE_API_URL` Environment Variable in your Frontend hosting dashboard to the new URL. No code changes needed!

### How to Update Safely
To ensure your live site never breaks:
1.  **Don't push directly to `main`**: Create a new branch for changes (e.g., `git checkout -b new-feature`).
2.  **Test Locally**: Run `npm start` (server) and `npm run dev` (client) to verify changes.
3.  **Merge & Deploy**: When happy, merge to `main`. Render/Netlify will auto-deploy the update.

## 6. Support
If you need help, refer to the `DEPLOYMENT_GUIDE.md` for more technical details.
