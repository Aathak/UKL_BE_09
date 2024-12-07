import { Router } from "express";
import { analisis, borrowAnalysis } from "../controllers/analisiscontroller";
import { validateUsageReport, borrowAnalysisValidation } from "../middlewares/analisis";
import { verifyRole, verifyToken } from "../middlewares/authorization";

const router = Router();

router.post("/usage-report", [verifyToken, verifyRole(["Admin"]), validateUsageReport], analisis);
router.post("/borrow-analysis", [verifyToken, verifyRole(["Admin"]), borrowAnalysisValidation], borrowAnalysis)

export default router;
