import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Budget from "../models/Budget";
import Transaction from "../models/Transaction";
import mongoose from "mongoose";

export const getBudgets = async (req: AuthRequest, res: Response) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const budgets = await Budget.find({ userId: req.userId, month, year });
        res.json({ success: true, data: budgets });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const upsertBudget = async (req: AuthRequest, res: Response) => {
    try {
        const { category, limit, period = "monthly" } = req.body;
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const budget = await Budget.findOneAndUpdate(
            { userId: req.userId, category, month, year },
            { limit, period },
            { new: true, upsert: true, runValidators: true }
        );
        console.log(`[DATA] Budget upserted: ${budget?.category} - Limit: ₹${budget?.limit} for user ${req.userId}`);

        res.json({ success: true, data: budget });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
    try {
        const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!budget) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Budget not found" } });

        res.json({ success: true, data: budget });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const getBudgetStatus = async (req: AuthRequest, res: Response) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const budgets = await Budget.find({ userId: req.userId, month, year });

        const expenses = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.userId as string), type: "expense", date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: "$category", totalSpent: { $sum: "$amount" } } }
        ]);

        const spentMap = new Map(expenses.map(e => [e._id, e.totalSpent]));

        const status = budgets.map(b => ({
            ...b.toObject(),
            spent: spentMap.get(b.category) || 0
        }));

        res.json({ success: true, data: status });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};
