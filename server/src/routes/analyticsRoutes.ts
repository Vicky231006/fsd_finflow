import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getSummary, getByCategory, getTrends, getForecast, getTopMerchants } from "../controllers/analyticsController";

const router = Router();
router.use(authMiddleware);

router.get("/summary", getSummary);
router.get("/by-category", getByCategory);
router.get("/trends", getTrends);
router.get("/forecast", getForecast);
router.get("/top-merchants", getTopMerchants);

export default router;
