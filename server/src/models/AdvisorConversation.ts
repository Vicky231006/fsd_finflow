import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export interface IAdvisorConversation extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const AdvisorConversationSchema = new Schema<IAdvisorConversation>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        messages: [MessageSchema],
    },
    { timestamps: true }
);

export default mongoose.model<IAdvisorConversation>(
    "AdvisorConversation",
    AdvisorConversationSchema
);
