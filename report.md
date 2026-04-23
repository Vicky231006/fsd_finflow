# Project Report: FinFlow AI
**Multi-Source Conversational Financial Intelligence Platform**

---

## 1. System Architecture
FinFlow AI utilizes a modern decoupled architecture designed for high throughput and intelligence portability. The system follows the **Client-Server** model with a heavy emphasis on **Asynchronous Processing**:

*   **Frontend Layer:** A Single Page Application (SPA) built with React and Vite, utilizing **Zustand** for centralized state management. It handles complex client-side logic including CSV parsing and real-time UI updates.
*   **Backend Layer:** A stateless Node.js REST API built with Express. It acts as an orchestration layer between the client, the deep learning engine, and the persistent storage.
*   **Intelligence Engine:** Integration with the **Google Gemini 2.0 Flash** API. The system uses a specific "Stream & Intercept" pattern; AI responses are streamed to the client via **Server-Sent Events (SSE)** while simultaneously being cached and validated on the backend.
*   **Persistence Layer:** A NoSQL MongoDB cluster that stores relational-style references (ObjectIds) to maintain data integrity while benefiting from document-based flexibility.

---

## 2. Technology Stack Justification
The **MERN Stack (MongoDB, Express, React, Node.js)** was selected due to its unified language environment and performance characteristics:

*   **TypeScript:** Implemented across the full stack to eliminate runtime "undefined" errors and ensure strict data contracts between the AI output and the database input.
*   **MongoDB Atlas:** Chosen for its ability to handle unstructured data. Financial logs vary wildly in format; a schema-less approach allows us to store raw SMS logs alongside structured records.
*   **React & Framer Motion:** Essential for achieving a "Premium Design" aesthetic with micro-animations that make financial logging feel less like a chore and more like a fluid interaction.
*   **Gemini 2.0 Flash:** Selected over GPT-4 for its superior speed-to-cost ratio in transaction classification and its native support for long-context financial advice.

---

## 3. Module Description
The platform is subdivided into five core engineering modules:

1.  **Identity & Security:** Implements JWT-based stateless authentication with password hashing via `bcryptjs`. Includes session persistence via a Refresh Token collection.
2.  **Conversational Ingestion (NLP):** The heart of the system. It parses raw strings (e.g., "Spent 500 on coffee") into valid JSON objects using deep learning fallbacks.
3.  **Analytics Pipeline:** Utilizes MongoDB Aggregation Framework to calculate real-time savings rates, category breakdowns, and month-on-month trends.
4.  **Budgetary Control:** Allows users to set hard limits on categories. The system performs cross-collection lookups to alert users when transaction volume exceeds budget thresholds.
5.  **AI Wealth Advisor:** A streaming chatbot that provides context-aware advice by analyzing the user's latest 30-day transaction summary and category breakdown.

---

## 4. Database Design (ER Diagram)
The system utilizes a **Relational-NoSQL** approach using `ObjectId` references:

```text
[User Collection]
  ├── _id (Primary Key)
  ├── name, email, password (hashed)
  ├── currency (e.g., INR)
  └── goals: [ { name, amount, deadline } ]  <-- Embedded Array

[Transaction Collection]
  ├── _id (Primary Key)
  ├── userId (Ref: User)
  ├── amount (Number)
  ├── category (Enum: food, transport, etc.)
  ├── description (String)
  ├── date (ISODate)
  └── source (Enum: manual, ai, csv, paste)

[Budget Collection]
  ├── userId (Ref: User)
  ├── category (String)
  ├── limit (Number)
  └── month/year (Date constraints)

[AdvisorConversation Collection]
  ├── userId (Ref: User)
  ├── title (Chat Summary)
  └── messages: [ { role, content, timestamp } ]
```

---

## 5. Implementation Details
*   **Optimistic UI Strategy:** To handle the latency of LLM APIs, the client performs "Optimistic Updates." When a message is sent, it is rendered locally before the backend confirms it, ensuring zero-perceived-lag for the user.
*   **Regex-NLP Fallback:** If the Gemini API hits a rate limit or goes offline, a custom keyword-based classifier (Regex) takes over to parse basic "Amount + Category" combinations, ensuring the system remains functional 100% of the time.
*   **Responsive Middleware:** Implemented custom CSS media queries and a "Dual Sidebar Toggle" to ensure the complex AI chat interface remains usable on mobile devices without spilling off-screen.

---

## 6. Challenges Faced & Solutions
1.  **AI Model 404 Errors:** Early versions failed because the Unified SDK had not yet migrated to `gemini-2.0-flash`. Solution: Updated the `@google/genai` library and implemented an "Adaptive SDK Property Access" to handle varying response chunk formats (`chunk.text()` vs `chunk.text`).
2.  **Date Parsing Ambiguity:** CSVs often mix `DD/MM` and `MM/DD`. Solution: Developed a logic-based parser that analyzes the day/month parts (e.g., if one part is >12, it must be the day) before defaulting to ISO standards.
3.  **Mobile Navigation Overlap:** The bottom navigation bar originally blocked content. Solution: Implemented a global `pb-24` padding strategy in the `RootLayout` to ensure full scrollability on mobile.

---

## 7. Future Scope
*   **WhatsApp/Telegram Integration:** Directly logging transactions via popular messaging APIs to reduce friction to zero.
*   **OCR Capability:** Implementing computer vision to read physical grocery and utility receipts.
*   **Automated Bill Reminders:** Using the AI engine to predict upcoming recurring payments based on historical date clusters.

---

## 8. Conclusion
FinFlow AI represents a significant shift from traditional "Database-Entry" budgeting to "Conversational Financial Intelligence." By combining the MERN stack with modern AI parsing, we have reduced the cognitive friction of financial logging, resulting in a more accurate and interactive wealth management experience.

---

## 9. References
*   React.js Documentation (v18+)
*   MongoDB Aggregation Pipeline Manual
*   Google Generative AI SDK Reference
*   TypeScript Handbook (Structural Typing)
*   Web Content Accessibility Guidelines (WCAG) for Financial Apps
