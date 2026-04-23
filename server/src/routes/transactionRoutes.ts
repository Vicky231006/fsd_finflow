import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
    createTransaction,
    getTransactions,
    getTransaction,
    updateTransaction,
    deleteTransaction,
    parseTransaction,
    parseBatchTransaction,
    confirmBatchTransaction
} from "../controllers/transactionController";

const router = Router();
router.use(authMiddleware);

router.post("/parse", parseTransaction);
router.post("/parse/batch", parseBatchTransaction);
router.post("/confirm", createTransaction);
router.post("/confirm/batch", confirmBatchTransaction);

router.post("/", createTransaction);
router.get("/", getTransactions);
router.get("/:id", getTransaction);
router.patch("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
