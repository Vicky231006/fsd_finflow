import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import AdvisorConversation from "../models/AdvisorConversation";
import Transaction from "../models/Transaction";
import mongoose from "mongoose";
import { streamAdvisorResponse } from "../ai/financialAdvisor";
import User from "../models/User";

export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const conversations = await AdvisorConversation.find({ userId: req.userId })
            .sort({ updatedAt: -1 })
            .select("-messages");
        res.json({ success: true, data: conversations });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const createConversation = async (req: AuthRequest, res: Response) => {
    try {
        const title = req.body?.title || "New Conversation";
        console.log(`[ADVISOR] Creating conversation for user: ${req.userId}`);
        const conversation = new AdvisorConversation({
            userId: new mongoose.Types.ObjectId(req.userId as string),
            title,
            messages: []
        });
        await conversation.save();
        res.status(201).json({ success: true, data: conversation });
    } catch (err: any) {
        console.error("[ADVISOR ERR] createConversation failed:", err);
        res.status(500).json({ success: false, error: { message: "Server error", details: err.message } });
    }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
    try {
        const conversation = await AdvisorConversation.findOne({ _id: req.params.id, userId: req.userId });
        if (!conversation) return res.status(404).json({ success: false, error: { message: "Not found" } });
        res.json({ success: true, data: conversation });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
    try {
        const conversation = await AdvisorConversation.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!conversation) return res.status(404).json({ success: false, error: { message: "Not found" } });
        res.json({ success: true, data: conversation });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const conversation = await AdvisorConversation.findOne({ _id: req.params.id, userId: req.userId });
        if (!conversation) {
            res.status(404).json({ success: false, error: { message: "Not found" } });
            return;
        }

        const { message } = req.body;
        if (!message) {
            res.status(400).json({ success: false, error: { message: "Message required" } });
            return;
        }

        // Add user message
        conversation.messages.push({ role: "user", content: message, timestamp: new Date() } as any);
        await conversation.save();

        // Gather 30 days context to save tokens
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentTransactions = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.userId as string), date: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { category: "$category" }, total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
            { $limit: 10 }
        ]);

        let contextString = "Top Categories (30 Days): ";
        contextString += recentTransactions.map(t => `${t._id.category}:₹${t.total}`).join(', ');

        const user = await User.findById(req.userId);
        let goalsString = "";
        if (user?.goals && user.goals.length > 0) {
            goalsString = "\nGoals: " + user.goals.map(g => `${g.name}:₹${g.amount}`).join(', ');
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const rawHistory = conversation.messages.map(m => ({ role: m.role, content: m.content }));
        let history = rawHistory.slice(-5);
        if (history.length > 0 && history[0].role === 'assistant') {
            history = history.slice(1);
        }

        // Intercept res.write to build up the final message content
        const originalWrite = res.write.bind(res);
        const originalEnd = res.end.bind(res);

        let assistantMessage = "";

        res.write = (chunk: any, encoding?: any, callback?: any) => {
            try {
                const str = chunk.toString();
                const lines = str.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                        const jsonStr = line.replace('data: ', '').trim();
                        if (jsonStr) {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.text) assistantMessage += parsed.text;
                        }
                    }
                }
            } catch (e) { }
            return originalWrite(chunk, encoding, callback);
        };

        res.end = (chunk?: any, encoding?: any, callback?: any) => {
            const finalContent = assistantMessage.trim() || "**FinFlow AI is briefly offline. Checking your connection...**";
            conversation.messages.push({ role: "assistant", content: finalContent, timestamp: new Date() } as any);
            conversation.save().catch(err => console.error("Could not save assistant msg", err));
            return originalEnd(chunk, encoding, callback);
        };

        await streamAdvisorResponse(contextString, goalsString, history, res);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: { message: "Server error" } });
        }
    }
};
