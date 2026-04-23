# FinFlow AI - Comprehensive Hosting & Deployment Guide

This guide covers the deployment of the complete FinFlow AI platform (MERN stack with Google Gemini integration). It is split into two independent deployments: the **Backend (Express/Node.js)** and the **Frontend (React/Vite)**.

---

## 1. Prerequisites

Before deploying, ensure you have the following credentials ready:
*   A **MongoDB Atlas** cluster URI (`MONGO_URI`).
*   A secure string for **JWT Authentication** (`JWT_SECRET`).
*   A **Google Gemini API Key** (`GEMINI_API_KEY`) from Google AI Studio. 

---

## 2. Deploying the Backend (API Server)

The backend is built with Node.js, Express, and TypeScript. We recommend deploying to **Render**, **Railway**, or **Vercel** (using `vercl.json` overrides for standard Express apps). The easiest approach is Render.

### Option A: Render (Recommended)
1. Register on [Render.com](https://render.com) and link your GitHub repository.
2. Click **New +** and select **Web Service**.
3. Connect your FinFlow repository.
4. **Configuration Settings:**
   *   **Root Directory:** `server`
   *   **Environment:** Node
   *   **Build Command:** `npm install && npx tsc`
   *   **Start Command:** `node dist/index.js`
5. **Environment Variables:**
   *   `PORT` = `5000` (or leave empty, Render assigns automatically)
   *   `MONGO_URI` = `mongodb+srv://...`
   *   `JWT_SECRET` = `your_super_secret_key`
   *   `GEMINI_API_KEY` = `your_gemini_key`
   *   `NODE_ENV` = `production`
6. Click **Deploy**. Render will grant you an URL like `https://finflow-backend.onrender.com`.

---

## 3. Deploying the Frontend (React Client)

The React frontend handles the UI and securely talks to the backend REST API. We recommend deploying to **Vercel** or **Netlify**.

### Option A: Vercel (Recommended)
1. Register on [Vercel.com](https://vercel.com) and link your GitHub repository.
2. Click **Add New Project**. Select your FinFlow repository.
3. **Configuration Settings:**
   *   **Framework Preset:** Vite
   *   **Root Directory:** `client` (Click edit to explicitly select this)
   *   **Build Command:** `npm run build`
   *   **Output Directory:** `dist`
4. **Environment Variables:**
   *   `VITE_API_BASE_URL` = `https://finflow-backend.onrender.com/api` *(Use the URL obtained from your Backend deployment! Important: Include `/api` at the end.)*
5. Click **Deploy**. Vercel will grant you an URL like `https://finflow-ai.vercel.app`.

---

## 4. Post-Deployment Checklist & Verification

1.  **CORS Configuration:** Once your frontend is deployed, ensure that the URL (e.g., `https://finflow-ai.vercel.app`) is allowed in the backend CORS settings. Open `server/src/index.ts` and set your production domain in `cors({ origin: [...] })`. If no domain restrictions are set globally, skip this.
2.  **Verify Routing:** React Router functions as a Single Page Application (SPA). Vercel handles fallback routing automatically for Vite out of the box, but if you get 404s on page refresh, you might need an `vercel.json` rewrite configuration in the `client/` folder.
3.  **Run a Test Transaction:**
    *   Navigate to your live frontend URL.
    *   Register a new account (Wait to see if MongoDB responds).
    *   Go to the **AI Advisor** and send a test message (Wait to see if the Gemini engine responds).

## 5. Maintenance / Keeping Data Protected
*   Never upload your `.env` files to GitHub.
*   Monitor your Gemini API Usage in the Google AI Studio to avoid exceeding the Free Tier quotas limit.
