import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import advisorRoutes from "./routes/advisorRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://fsd-finflow-website.onrender.com",
    "https://fsd-finflow.vercel.app"
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();
    console.log(`\n\x1b[36m[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\x1b[0m`);
    if (req.body && Object.keys(req.body).length) {
        const bodyStr = JSON.stringify(req.body, null, 2);
        if (bodyStr.length > 2000) {
            console.log("BODY: [Too large to log]");
        } else {
            console.log("BODY:", bodyStr);
        }
    }
    if (req.query && Object.keys(req.query).length) console.log("QUERY:", JSON.stringify(req.query, null, 2));

    const oldJson = res.json;
    res.json = function (data) {
        console.log(`\x1b[32m[${res.statusCode}] ${req.method} ${req.originalUrl} - ${Date.now() - start}ms\x1b[0m`);
        return oldJson.apply(res, arguments as any);
    };
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/advisor", advisorRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || "INTERNAL_ERROR",
            message: err.message || "Something went wrong",
        },
    });
});

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
