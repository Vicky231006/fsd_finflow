import mongoose, { Schema, Document } from "mongoose";

export type TransactionCategory =
    | "food" | "transport" | "housing" | "entertainment"
    | "shopping" | "health" | "education" | "utilities"
    | "salary" | "freelance" | "investment" | "other";

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    type: "expense" | "income";
    category: TransactionCategory;
    description: string;
    rawInput?: string;
    date: Date;
    source: "chat" | "paste" | "manual" | "csv";
    tags?: string[];
    createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true, min: 0 },
        type: { type: String, enum: ["expense", "income"], required: true },
        category: {
            type: String,
            enum: [
                "food", "transport", "housing", "entertainment",
                "shopping", "health", "education", "utilities",
                "salary", "freelance", "investment", "other"
            ],
            required: true
        },
        description: { type: String, required: true, maxlength: 100 },
        rawInput: { type: String },
        date: { type: Date, default: Date.now },
        source: { type: String, enum: ["chat", "paste", "manual", "csv"], required: true },
        tags: [{ type: String }],
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
