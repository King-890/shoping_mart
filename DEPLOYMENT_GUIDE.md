# Deployment Guide: Folder Mart Backend (Render)

This guide will help you deploy the backend of "Folder Mart" to Render.com.

## Prerequisites
1.  **GitHub Account**: You must have a GitHub account.
2.  **Code Pushed**: This code must be pushed to a GitHub repository.

## Step 1: Sign Up / Log In to Render
1.  Go to [https://render.com](https://render.com).
2.  Sign up or log in using your **GitHub account**.

## Step 2: Create a New Web Service
1.  Click the **"New +"** button in the dashboard and select **"Web Service"**.
2.  Select **"Build and deploy from a Git repository"**.
3.  Connect your GitHub account if you haven't already.
4.  Find your `Folder-Mart` (or whatever you named it) repository and click **"Connect"**.

## Step 3: Configure the Service
Render will try to auto-detect settings, but you should verify them against these values:

-   **Name**: `folder-mart-backend` (or any name you like)
-   **Region**: Choose the one closest to your users (e.g., Singapore for India).
-   **Branch**: `main` (or `master`)
-   **Root Directory**: `server` (Important! This tells Render the app is in the server folder)
-   **Runtime**: `Node`
-   **Build Command**: `npm install`
-   **Start Command**: `node index.js`
-   **Instance Type**: Free (for hobby/dev)

## Step 4: Environment Variables
Scroll down to the **Environment Variables** section and add the following:

| Key | Value |
| :--- | :--- |
| `RAZORPAY_KEY_ID` | `rzp_test_YOUR_ACTUAL_KEY` (Get this from Razorpay Dashboard) |
| `RAZORPAY_KEY_SECRET` | `YOUR_ACTUAL_SECRET` (Get this from Razorpay Dashboard) |
| `PORT` | `10000` (Render usually sets this automatically, but good to have) |

> **Note**: For this file-based DB version, you do **not** need `MONGO_URI`.

## Step 5: Deploy
1.  Click **"Create Web Service"**.
2.  Render will start building your app. You can watch the logs in the dashboard.
3.  Once the build finishes and the service is "Live", you will get a URL like `https://folder-mart-backend.onrender.com`.

## Step 6: Connect Frontend (Netlify/Vercel)
When deploying your frontend, make sure to set these Environment Variables:

1.  **VITE_API_URL**: Your Render backend URL (e.g., `https://folder-mart.onrender.com`).
2.  **VITE_FIREBASE_API_KEY**: Your Firebase API Key.
3.  **VITE_FIREBASE_AUTH_DOMAIN**: Your Firebase Auth Domain.
4.  **VITE_FIREBASE_PROJECT_ID**: Your Firebase Project ID.
5.  **VITE_FIREBASE_STORAGE_BUCKET**: Your Firebase Storage Bucket.
6.  **VITE_FIREBASE_MESSAGING_SENDER_ID**: Your Firebase Messaging Sender ID.
7.  **VITE_FIREBASE_APP_ID**: Your Firebase App ID.
8.  **VITE_RAZORPAY_KEY_ID**: Your Razorpay Key ID.

> [!TIP]
> Use the provided `.env.example` files in the `client` and `server` directories as a template.


## Important: Persistence Strategy
> [!NOTE]
> **Firebase Integrated**: The application has been migrated to use **Firebase (Auth & Firestore)** for Authentication and Data (Products, Orders, Messages). This ensures data persistence across deployments.
>
> **What stays on Render?**
> The Node.js backend on Render handles **Razorpay Payment Integration**, **Notifications (Email/SMS)**, and **Product Management API**.
>
> ### Firebase Setup (Required)
> 1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
> 2. Enable **Authentication** (Email/Password).
> 3. Enable **Cloud Firestore** in test mode or with appropriate rules.
> 4. Go to **Project Settings > Service Accounts** and generate a new private key. Save it as `server/serviceAccountKey.json`.
> 5. Create a Web App in Firebase settings to get your client-side config keys.

