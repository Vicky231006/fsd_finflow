# FinFlow AI — Premium Wealth Intelligence

FinFlow AI is a high-performance, production-grade financial intelligence platform designed to transform messy, unstructured financial data (SMS, chats, receipts) into actionable insights using AI. Built with a stunning **Midnight & Lime** aesthetic, it provides a seamless experience for tracking expenses, managing budgets, and gaining deep financial clarity.

---

## 🏗️ System Architecture & Full Flow

### 1. The Entry Point: Landing Page
When a user visits the website, they are greeted by the **Landing Page** (`client/src/pages/Landing.tsx`). 
- **The Hook:** A cinematic hero section with "Midnight & Lime" glassmorphism, floating financial icons, and a mockup search bar that explains the AI parsing value proposition.
- **The Transition:** Uses `Framer Motion` for a high-end "Lime Wipe" transition when moving to the Auth pages.

### 2. Authentication Flow
- **Client Side:** `Register.tsx` or `Login.tsx` captures user credentials.
- **State Management:** The `authStore.ts` (Zustand) handles the API call via Axios. It stores the `accessToken` in `localStorage` and the `user` object in memory.
- **Backend Handlers:** Data is sent to `server/src/routes/authRoutes.ts`.
- **Validation & Persistence:** The `authController.ts` validates the request, hashes passwords using `bcrypt`, and stores the user in **MongoDB**. It returns a **JWT (JSON Web Token)** which is used for all subsequent authenticated requests.

### 3. The Core Dashboard & Context Loading
Upon login, the user is redirected to `/app/dashboard`.
- **Global Config:** `App.tsx` runs a `useEffect` that triggers `fetchConfig()` from the `authStore` to ensure the user's profile and settings are always loaded.
- **Data Aggregation:** The `Dashboard.tsx` component orchestrates multiple calls to `analyticsStore.ts` and `transactionStore.ts` to populate charts (Recharts) and KPI cards.

### 4. Transaction Management & Infinite Scroll
Located in `Transactions.tsx`, this is the heartbeat of the app's data management.
- **Infinite Scrolling Implementation:**
    - **Client:** A `sentinel` div with a `useRef` (called `observerTarget`) is placed at the bottom of the table.
    - **Logic:** An `IntersectionObserver` watches this sentinel. When it enters the viewport (user scrolls to bottom), it triggers `fetchTransactions` with `append: true`.
    - **Zustand Cache:** The `transactionStore.ts` takes the new page of data and appends it to the existing array:
      ```typescript
      transactions: append ? [...state.transactions, ...data.data] : data.data
      ```
- **Backend Pagination:** The `getTransaction` controller in `transactionController.ts` uses MongoDB's `.skip()` and `.limit()` based on the `page` query parameter to serve data in chunks.

### 5. AI Parsing Engine (The "Magic")
When a user "dumps" messy text in `InputPage.tsx`:
- **Step 1:** Text is sent to `/api/transactions/parse`.
- **Step 2 (Primary):** The `parseTransaction.ts` (Backend AI Service) invokes **Gemini 2.0 Flash**. It uses a strict system prompt to extract `amount`, `category`, `description`, and `type` into valid JSON.
- **Step 3 (Fallback):** If the AI is unavailable or the input is unparseable, a **Regex-based Keyword Classifier** takes over. It checks for common Indian context keywords like "UPI", "Swiggy", "Zomato", "Rickshaw", "Salary", etc., to ensure the user always gets a result.

---

## 💾 Caching & State Persistence

FinFlow AI utilizes a multi-layered approach to ensure speed and reliability:

1.  **JWT LocalStorage:** The authentication token is persisted to survive page refreshes.
2.  **Zustand Memory Cache:** 
    - **Stores:** `authStore`, `transactionStore`, `analyticsStore`, `budgetStore`, `advisorStore`.
    - **Why:** By keeping the state global, we avoid "prop drilling" and ensure that if a user deletes a transaction in the `Transactions` page, the `Dashboard` and `Budget` charts update instantly via cross-store triggers.
3.  **Cross-Store Invalidation:** When a mutation occurs (Add/Delete), the `transactionStore` calls internal fetchers of other stores (e.g., `analyticsStore.fetchAll()`) to keep the "cache" fresh without a full page reload.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Zod (Validation).
- **AI Integration:** Google Gemini SDK (Gemini-2.0-Flash).
- **State Management:** Zustand.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Gemini API Key (Google AI Studio)

### Installation

1.  **Clone & Install:**
    ```bash
    npm install
    cd client && npm install
    cd ../server && npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file in the `server` folder:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_super_secret_key
    GEMINI_API_KEY=your_gemini_key
    CLIENT_URL=http://localhost:5173
    ```

3.  **Run Locally:**
    - **Backend:** `cd server && npm run dev`
    - **Frontend:** `cd client && npm run dev`

---

## 🔒 Security
- **Data Anonymization:** Raw text sent to Gemini is stripped of sensitive identifiers before processing.
- **JWT Auth:** Every API route (except `/auth`) is guarded by `authMiddleware`.
- **Input Sanitization:** Handled by `Zod` schemas on the backend to prevent injection or malformed data.

---

*Built with ❤️ for Financial Clarity.*
