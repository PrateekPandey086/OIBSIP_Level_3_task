# 🚀 Deployment Guide — PizzaCraft MERN App

> **Stack:** React + Vite → **Vercel** | Express + Socket.io → **Render** | **MongoDB Atlas**

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)
3. [Deploy Backend to Render](#3-deploy-backend-to-render)
4. [Deploy Frontend to Vercel](#4-deploy-frontend-to-vercel)
5. [Wire Frontend + Backend Together](#5-wire-frontend--backend-together)
6. [Post-Deployment Checklist](#6-post-deployment-checklist)
7. [Environment Variables Reference](#7-environment-variables-reference)

---

## 1. Prerequisites

Before deploying, make sure you have accounts on:

| Service | URL | Purpose |
|---|---|---|
| GitHub | [github.com](https://github.com) | Host your code |
| Render | [render.com](https://render.com) | Backend hosting |
| Vercel | [vercel.com](https://vercel.com) | Frontend hosting |
| MongoDB Atlas | [cloud.mongodb.com](https://cloud.mongodb.com) | Database |
| Cloudinary | [cloudinary.com](https://cloudinary.com) | Image uploads |
| Razorpay | [dashboard.razorpay.com](https://dashboard.razorpay.com) | Payments |

**Push your code to GitHub first:**

```bash
git add .
git commit -m "production-ready: deployment audit fixes"
git push origin main
```

> ⚠️ Make sure `.env` is in `.gitignore` and is **NOT** committed. Your secrets stay local.

---

## 2. MongoDB Atlas Setup

### Step 1 — Create a Cluster (skip if you already have one)

1. Log in at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **Create** → Choose **M0 Free Tier** → Select a region close to your Render region
3. Set a database username and password (save these — you'll need them)

### Step 2 — Whitelist All IPs ⚠️ (Required for Render)

Render uses **dynamic IP addresses** that change on every deploy. You must allow all IPs:

1. Left sidebar → **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** → Confirms as `0.0.0.0/0`
4. Click **Confirm**

### Step 3 — Get Your Connection String

1. Left sidebar → **Database** → Click **Connect** on your cluster
2. Select **Drivers** → Driver: **Node.js**
3. Copy the connection string — it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>
   ```
4. Replace `<password>` with your actual DB password
5. Replace `<dbname>` with `pizza-app`

**Final MONGO_URI example:**
```
mongodb+srv://myuser:mypassword@cluster0.mn6o937.mongodb.net/pizza-app
```

---

## 3. Deploy Backend to Render

### Step 1 — Create a Web Service

1. Log in at [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub account and select your repository
4. Configure:

   | Field | Value |
   |---|---|
   | **Name** | `pizzacraft-server` (or any name) |
   | **Root Directory** | `server` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (or Starter for no sleep) |

### Step 2 — Add Environment Variables

In the Render dashboard, go to your service → **Environment** tab → add each variable:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your full Atlas connection string |
| `JWT_SECRET` | A strong random string (32+ chars) — [generate one](https://1password.com/password-generator/) |
| `JWT_REFRESH_SECRET` | A **different** strong random string |
| `JWT_EXPIRE` | `15m` |
| `JWT_REFRESH_EXPIRE` | `7d` |
| `CLIENT_URL` | *(leave blank for now — fill in after Step 4)* |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `RAZORPAY_KEY_ID` | `rzp_live_...` or `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Your Gmail **App Password** (not your account password) |

> ⚠️ **Do NOT set `PORT`** — Render injects this automatically. Setting it manually can prevent your server from starting.

> 💡 **Gmail App Password:** Google Account → Security → 2-Step Verification → App passwords → Generate a 16-character password for "Mail".

### Step 3 — Deploy

1. Click **Create Web Service**
2. Watch the deploy logs — you should see:
   ```
   Connecting to MongoDB Atlas...
   MongoDB Connected: cluster0.xxxxx.mongodb.net
   Server running in production mode on port 10000
   ```
3. **Copy your Render URL** — it looks like `https://pizzacraft-server.onrender.com`

---

## 4. Deploy Frontend to Vercel

### Step 1 — Import Project

1. Log in at [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:

   | Field | Value |
   |---|---|
   | **Root Directory** | `client` |
   | **Framework Preset** | Vite *(auto-detected)* |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

### Step 2 — Add Environment Variables

Before clicking Deploy, click **Environment Variables** and add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-render-url.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://your-render-url.onrender.com` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_...` or `rzp_test_...` *(same as backend)* |

Replace `your-render-url` with the actual Render URL from Step 3 above.

### Step 3 — Deploy

1. Click **Deploy**
2. Wait ~2 minutes for the build to complete
3. **Copy your Vercel URL** — it looks like `https://pizzacraft.vercel.app`

---

## 5. Wire Frontend + Backend Together

After both are deployed, you need to tell the backend where the frontend lives (for CORS).

1. Go to your **Render** dashboard → your web service → **Environment** tab
2. Find the `CLIENT_URL` variable and set its value to your Vercel URL:
   ```
   CLIENT_URL=https://pizzacraft.vercel.app
   ```
3. Click **Save Changes**
4. Render will automatically redeploy with the updated CORS settings

---

## 6. Post-Deployment Checklist

Test every flow after deployment:

- [ ] Open `https://your-app.vercel.app` — homepage loads
- [ ] Refresh `/menu` — does **NOT** 404 (SPA rewrite working)
- [ ] Register a new account → check for welcome email
- [ ] Login → navigate to `/dashboard` → refresh page → still logged in
- [ ] Add 1–2 items to cart → go to `/checkout`
- [ ] Click **Pay** → Razorpay modal opens
- [ ] Complete a test payment using Razorpay test card:
  - Card: `4111 1111 1111 1111`
  - Expiry: any future date
  - CVV: any 3 digits
  - OTP: `1234`
- [ ] Check order appears in `/orders`
- [ ] Login as admin → `/admin` dashboard loads → order appears
- [ ] Check Render logs — no raw passwords or tokens in output

---

## 7. Environment Variables Reference

### Backend (`server/.env`) — also enter these in Render dashboard

```env
# Server
NODE_ENV=production
# PORT is NOT set here — Render injects it automatically

# MongoDB Atlas
MONGO_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/pizza-app

# JWT — generate strong secrets at: https://1password.com/password-generator/
JWT_SECRET=your_strong_random_32_char_secret_here
JWT_REFRESH_SECRET=your_different_strong_32_char_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS — set to your Vercel URL after deploying frontend
CLIENT_URL=https://your-app.vercel.app

# Cloudinary — from cloudinary.com dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay — from dashboard.razorpay.com > Settings > API Keys
RAZORPAY_KEY_ID=rzp_test_or_live_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Gmail SMTP — use App Password, not your real password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_16_char_app_password
```

### Frontend — enter these in Vercel dashboard under Environment Variables

```env
VITE_API_URL=https://your-render-url.onrender.com/api
VITE_SOCKET_URL=https://your-render-url.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_or_live_key
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `CORS error` in browser | `CLIENT_URL` not set on Render | Add Vercel URL to `CLIENT_URL` env var and redeploy |
| Page refresh → 404 | `vercel.json` missing | Already created — ensure `client/vercel.json` is committed |
| `MongoDB connection failed` | Atlas IP not whitelisted | Add `0.0.0.0/0` in Atlas → Network Access |
| Payment gateway error 401 | Razorpay keys expired/invalid | Generate new keys at Razorpay dashboard |
| Emails not sending | Gmail App Password wrong | Re-generate App Password in Google Account settings |
| Server sleeps after 15 min | Render Free tier | Upgrade to Starter, or use [UptimeRobot](https://uptimerobot.com) to ping every 10 min |
| Socket.io not connecting | `VITE_SOCKET_URL` not set | Add the Render URL to Vercel env vars and redeploy |

---

## Deployment Order Summary

```
1. Push code to GitHub
       ↓
2. MongoDB Atlas — whitelist 0.0.0.0/0, get connection string
       ↓
3. Render — deploy server, set all env vars (leave CLIENT_URL blank for now)
       ↓
4. Vercel — deploy client, set VITE_API_URL and VITE_SOCKET_URL to Render URL
       ↓
5. Render — update CLIENT_URL to your Vercel URL, trigger redeploy
       ↓
6. Done ✅ — run the post-deployment checklist
```
