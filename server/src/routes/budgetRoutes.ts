import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getBudgets, upsertBudget, deleteBudget, getBudgetStatus } from "../controllers/budgetController";

const router = Router();
router.use(authMiddleware);

router.get("/", getBudgets);
router.post("/", upsertBudget);
router.get("/status", getBudgetStatus);
router.delete("/:id", deleteBudget);

export default router;
