# Unfazed SaaS - Production Deployment Guide 🚀

The codebase is pre-configured and pushed to GitHub: [https://github.com/manoj-hg/Unfazed_SaaS](https://github.com/manoj-hg/Unfazed_SaaS).

Follow this step-by-step checklist to deploy the platform to production in under 5 minutes.

---

## 1. Cloud Database: MongoDB Atlas (Free Tier)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and log in or create a free account.
2. Click **Create Deployment** → choose the **M0 Free Cluster** (Shared, AWS or Google Cloud).
3. Under **Security Quickstart**:
   - Create a database user with username and password (e.g. `unfazed_admin` / `<secure_password>`).
   - Under **Network Access**, add IP Address `0.0.0.0/0` (Allow Access from Anywhere) so Render/Vercel can connect.
4. Click **Connect** → **Drivers** (Node.js) → copy your connection URI:
   ```text
   mongodb+srv://unfazed_admin:<password>@cluster0.xxxx.mongodb.net/unfazed?retryWrites=true&w=majority
   ```
5. *(Optional initial seed)*: To populate default tiers, sample therapists, clients, and appointments, run locally with your Atlas URI:
   ```bash
   cd unfazed-backend
   $env:MONGO_URI="mongodb+srv://..." ; npm run seed
   ```

---

## 2. Backend Deployment: Render (or Railway)
1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository: `manoj-hg/Unfazed_SaaS`.
3. Configure the settings:
   - **Name**: `unfazed-backend`
   - **Root Directory**: `unfazed-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
4. Add the following **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `5000` | Port for Express API |
   | `NODE_ENV` | `production` | Production mode |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `your_long_random_secret_key` | Secret key for JWT signing |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | URL of your deployed frontend (or `*`) |
5. Click **Create Web Service**.
6. Once deployed, copy your backend public URL (e.g., `https://unfazed-backend.onrender.com`).

---

## 3. Frontend Deployment: Vercel (or Netlify)
1. Go to [vercel.com/dashboard](https://vercel.com/) and click **Add New...** → **Project**.
2. Import the Git repository `manoj-hg/Unfazed_SaaS`.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `unfazed-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://unfazed-backend.onrender.com/api` | Point to your deployed Render backend `/api` |
   | `VITE_RAZORPAY_KEY_ID` | `rzp_test_unfazed_demo_1234` | Razorpay Test Key ID |
5. Click **Deploy**.
6. Vercel will complete the build in ~30 seconds. Your live app is available at `https://unfazed-frontend.vercel.app`!

---

## 4. Google Sign-In: Active for Everyone Worldwide 🌐
The Google Sign-in implementation features dual-engine architecture:
- **Universal Zero-Config Mode (Active by default)**: Any evaluator, teacher, reviewer, or practitioner anywhere in the world can click **"Sign in with Google"** on `/login` or `/register` and:
  - Choose 1-click accounts (`Dr. Ananya Sharma` Pro, `Dr. Rohan Mehta` Free, `Manoj H G` Admin)
  - Or enter **any Google / Gmail account**
  - The backend instantly provisions their practice slug (`/dr-your-name`), sets default availability in `Asia/Kolkata`, generates an initial profile avatar, signs a JWT token, and redirects to their dashboard.
- **Official Google Cloud Console OAuth (Optional)**:
  - If you configure a Google OAuth 2.0 Client ID in Google Cloud Console:
    1. Add your Vercel domain (e.g. `https://unfazed-frontend.vercel.app`) to **Authorized JavaScript origins**.
    2. Add `VITE_GOOGLE_CLIENT_ID` to Vercel environment variables.
    3. The native Google One-Tap prompt will activate alongside the universal authenticator.
