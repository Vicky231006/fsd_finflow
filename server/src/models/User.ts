import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  currency: string;
  monthlyBudget?: number;
  goals: {
    name: string;
    amount: number;
    deadline?: Date;
    createdAt: Date;
  }[];
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    currency: { type: String, default: "INR" },
    monthlyBudget: { type: Number },
    goals: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      deadline: { type: Date },
      createdAt: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
