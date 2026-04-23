import mongoose, { Schema, Document } from "mongoose";
import { TransactionCategory } from "./Transaction";

export interface IBudget extends Document {
    userId: mongoose.Types.ObjectId;
    category: TransactionCategory;
    limit: number;
    period: "monthly" | "weekly";
    month: number;
    year: number;
    createdAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        category: {
            type: String,
            enum: [
                "food", "transport", "housing", "entertainment",
                "shopping", "health", "education", "utilities",
                "salary", "freelance", "investment", "other"
            ],
            required: true
        },
        limit: { type: Number, required: true, min: 0 },
        period: { type: String, enum: ["monthly", "weekly"], default: "monthly" },
        month: { type: Number, required: true, min: 1, max: 12 },
        year: { type: Number, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IBudget>("Budget", BudgetSchema);
