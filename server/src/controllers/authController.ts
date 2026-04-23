import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: { message: "Email already exists" } });
        }

        const user = new User({ name, email, password });
        await user.save();

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1d" });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

        res.status(201).json({
            success: true,
            data: { user: { id: user._id, name, email }, accessToken, refreshToken }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await (user as any).comparePassword(password))) {
            return res.status(401).json({ success: false, error: { message: "Invalid credentials" } });
        }

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1d" });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

        res.json({
            success: true,
            data: { user: { id: user._id, name: user.name, email, goals: user.goals }, accessToken, refreshToken }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ success: false, error: { message: "Refresh token required" } });

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ success: false, error: { message: "Invalid token" } });

        const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1d" });
        const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

        res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
    } catch (err) {
        res.status(401).json({ success: false, error: { message: "Invalid or expired token" } });
    }
};

export const logout = async (req: AuthRequest, res: Response) => {
    res.json({ success: true, message: "Logged out" });
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ success: false, error: { message: "User not found" } });
        res.json({ success: true, data: { user } });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: "Server error" } });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { goals } = req.body;
        console.log(`[AUTH] updateProfile CALLED for : ${req.userId}`, { goals });

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { goals } },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return res.status(404).json({ success: false, error: { message: "User not found" } });

        console.log("[AUTH] Profile updated successfully", user.goals);
        res.json({ success: true, data: { user } });
    } catch (err: any) {
        console.error("[AUTH ERR] updateProfile failed:", err);
        res.status(500).json({ success: false, error: { message: "Server error", details: err.message } });
    }
};
