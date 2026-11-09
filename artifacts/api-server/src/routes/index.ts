import { Router, type IRouter } from "express";
import healthRouter from "./health";
import firebaseAuthRouter from "./firebase-auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(firebaseAuthRouter);

export default router;
