import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Transaction from "../models/Transaction";
import Budget from "../models/Budget";
import mongoose from "mongoose";

export const getSummary = async (req: AuthRequest, res: Response) => {
    try {
        const { period = "currentMonth" } = req.query;
        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (period === "currentMonth") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        const matchStage: any = { userId: new mongoose.Types.ObjectId(req.userId as string) };
        if (startDate && endDate) {
            matchStage.date = { $gte: startDate, $lte: endDate };
            matchStage.description = { $ne: "Initial Cash in Bank" };
        }

        const summary = await Transaction.aggregate([
            { $match: matchStage },
            { $group: { _id: "$type", total: { $sum: "$amount" } } }
        ]);

        let income = 0;
        let expense = 0;
        summary.forEach(s => {
            if (s._id === "income") income = s.total;
            if (s._id === "expense") expense = s.total;
        });

        res.json({ success: true, data: { income, expense, balance: income - expense } });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const getByCategory = async (req: AuthRequest, res: Response) => {
    try {
        const { period = "currentMonth" } = req.query;
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        let startDate = new Date(year, now.getMonth(), 1);
        let endDate = new Date(year, now.getMonth() + 1, 0, 23, 59, 59);

        const breakdown = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.userId as string), type: "expense", date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } }
        ]);

        const budgets = await Budget.find({ userId: req.userId, month, year });

        const results = budgets.map(b => {
            const spent = breakdown.find(d => d._id === b.category)?.total || 0;
            return { _id: b.category, total: spent, limit: b.limit };
        });

        breakdown.forEach(d => {
            if (!results.find(r => r._id === d._id)) {
                results.push({ _id: d._id, total: d.total, limit: 0 });
            }
        });

        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const getTrends = async (req: AuthRequest, res: Response) => {
    try {
        const trends = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId as string),
                    description: { $ne: "Initial Cash in Bank" }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" }, type: "$type" },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json({ success: true, data: trends });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const getForecast = async (req: AuthRequest, res: Response) => {
    try {
        // Simple 10% growth forecast as placeholder
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);

        const lastMonth = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.userId as string), date: { $gte: start } } },
            { $group: { _id: "$type", total: { $sum: "$amount" } } }
        ]);

        res.json({ success: true, data: { status: "stable", prediction: 0 } });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const getTopMerchants = async (req: AuthRequest, res: Response) => {
    try {
        const topMerchants = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.userId as string), type: "expense" } },
            { $group: { _id: "$description", total: { $sum: "$amount" }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 10 }
        ]);
        res.json({ success: true, data: topMerchants });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};
