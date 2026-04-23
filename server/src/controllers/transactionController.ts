import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Transaction from "../models/Transaction";
import { z } from "zod";
import { parseTransactionText, parseBatchText } from "../ai/parseTransaction";

const CATEGORIES = [
    "food", "transport", "housing", "entertainment",
    "shopping", "health", "education", "utilities",
    "salary", "freelance", "investment", "other"
] as const;

const createTransactionSchema = z.object({
    amount: z.number().positive(),
    type: z.enum(["expense", "income"]),
    category: z.enum(CATEGORIES),
    description: z.string().min(1).max(100),
    date: z.string().datetime().optional().or(z.date().optional()),
    tags: z.array(z.string()).optional(),
    source: z.enum(["chat", "paste", "manual", "csv"]).optional().default("manual"),
    rawInput: z.string().optional()
});

export const createTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const parsed = createTransactionSchema.parse({
            ...req.body,
            date: req.body.date ? new Date(req.body.date) : new Date()
        });

        const transaction = new Transaction({
            userId: req.userId,
            ...parsed
        });
        await transaction.save();
        console.log(`[DATA] Transaction created: ${transaction.description} - ₹${transaction.amount} (${transaction.type}) for user ${req.userId}`);

        res.status(201).json({ success: true, data: transaction });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.issues } });
        }
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 20, category, type, from, to, search } = req.query;

        let query: any = { userId: req.userId };
        if (category) query.category = category;
        if (type) query.type = type;
        if (from || to) {
            query.date = {};
            if (from) query.date.$gte = new Date(from as string);
            if (to) query.date.$lte = new Date(to as string);
        }
        if (search) {
            query.description = { $regex: search, $options: 'i' };
        }

        const transactions = await Transaction.find(query)
            .sort({ date: -1, createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            success: true,
            data: transactions,
            meta: { total, page: Number(page), limit: Number(limit) }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const getTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
        if (!transaction) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Transaction not found" } });

        res.json({ success: true, data: transaction });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        console.log(`[DATA] Transaction updated: ${transaction?.description} for user ${req.userId}`);

        if (!transaction) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Transaction not found" } });

        res.json({ success: true, data: transaction });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!transaction) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Transaction not found" } });

        res.json({ success: true, data: transaction });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const parseTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({ success: false, error: { message: "Text required" } });
            return;
        }

        const parsed = await parseTransactionText(text);
        if (!parsed) {
            res.status(400).json({ success: false, error: { code: "PARSE_FAILED", message: "Could not parse transaction" } });
            return;
        }

        res.json({ success: true, data: parsed });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const parseBatchTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({ success: false, error: { message: "Text required" } });
            return;
        }

        const parsedArray = await parseBatchText(text);
        res.json({ success: true, data: parsedArray });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const confirmBatchTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { transactions } = req.body;
        if (!Array.isArray(transactions)) {
            res.status(400).json({ success: false, error: { message: "Array expected" } });
            return;
        }

        const toInsert = transactions.map(t => ({
            userId: req.userId,
            ...t,
            date: t.date ? new Date(t.date) : new Date()
        }));

        const result = await Transaction.insertMany(toInsert, { ordered: false });
        console.log(`[DATA] Bulk insert success: ${result.length} transactions stored for user ${req.userId}`);
        res.status(201).json({ success: true, count: result.length });
    } catch (err: any) {
        console.error(`[ERROR] Bulk insert failed for user ${req.userId}:`, err.message);
        // Even if some failed, some might have succeeded with ordered: false
        res.status(207).json({
            success: false,
            error: { message: "Some transactions failed validation", details: err.writeErrors?.length || 1 }
        });
    }
};
