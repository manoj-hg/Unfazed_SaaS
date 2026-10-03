# Unfazed - SaaS Platform for Therapists

Unfazed is a comprehensive, end-to-end SaaS platform built specifically for therapists in India. It empowers mental health professionals to seamlessly manage their private practice—covering client acquisition, scheduling, digital intake, clinical documentation, payments, and business analytics—all through one branded public link.

## 🌟 Previews

Here is a glimpse of the Unfazed platform in action:

![App Preview 1](Screenshot%202026-10-03%20110505.png)
![App Preview 2](Screenshot%202026-10-03%20110600.png)
![App Preview 3](Screenshot%202026-10-03%20110624.png)

## 🚀 Key Features

*   **Custom Branded Public Portal:** Therapists get their own unique URL (e.g., `localhost:5173/dr-sharma`) showcasing their specializations, bio, and a smooth booking interface.
*   **Smart Scheduling System:** Define weekly availability and buffer times. Dynamic slot generation handles timezones and prevents double-booking using MongoDB compound indexes.
*   **Client CRM & Digital Intake:** Centralized dashboard to view active/inactive clients. Includes a built-in digital consent and medical history intake form.
*   **Clinical Documentation:** Rich-text editor powered by TipTap. Therapists can maintain a timeline of both **Private Notes** (for their eyes only) and **Shared Notes** (accessible to the client).
*   **Payments Integration:** Fully integrated Razorpay checkout flows for sessions and packages.
*   **Advanced Analytics:** A visual dashboard using Recharts and MongoDB Aggregations to track active clients, completed sessions, and monthly revenue.
*   **Entitlements & Subscriptions:** Feature gating built-in to handle 'Free', 'Pro', and 'Enterprise' tiers.

## 🛠️ Tech Stack

This project is built using a modern JavaScript stack (MERN):

**Frontend (unfazed-frontend):**
*   React.js with Vite
*   Tailwind CSS for beautiful, responsive styling
*   Lucide React for crisp vector icons
*   Recharts for data visualization
*   React Hook Form for robust form handling
*   TipTap for rich-text editing

**Backend (unfazed-backend):**
*   Node.js & Express
*   MongoDB & Mongoose
*   JSON Web Tokens (JWT) for secure authentication
*   Socket.io for real-time communication
*   date-fns for complex timezone logic
*   Razorpay SDK for payments

## 💻 Running Locally

### Prerequisites
*   Node.js installed
*   MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/manoj-hg/Unfazed_SaaS.git
cd Unfazed_SaaS
```

### 2. Setup the Backend
```bash
cd unfazed-backend
npm install

# Create a .env file with the following:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/unfazed
# JWT_SECRET=your_super_secret_jwt_key
# RAZORPAY_KEY_ID=your_razorpay_key
# RAZORPAY_KEY_SECRET=your_razorpay_secret

npm run dev
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd unfazed-frontend
npm install
npm run dev
```

The app will be running at `http://localhost:5173`.

## 🔒 License
This project is proprietary and built by Manoj H G.
