import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ success: false, error: { code: "AUTH_REQUIRED", message: "No token provided" } });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Token is invalid or expired" } });
    }
};
