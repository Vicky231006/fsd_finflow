import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
    getConversations,
    createConversation,
    getConversation,
    deleteConversation,
    sendMessage,
} from "../controllers/advisorController";

const router = Router();
router.use(authMiddleware);

router.get("/conversations", getConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:id", getConversation);
router.post("/conversations/:id/message", sendMessage);
router.delete("/conversations/:id", deleteConversation);

export default router;
