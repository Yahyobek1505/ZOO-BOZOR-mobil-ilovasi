import { Router, type IRouter } from "express";
import healthRouter from "./health";
import firebaseAuthRouter from "./firebase-auth";
import listingsRouter from "./listings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(firebaseAuthRouter);
router.use(listingsRouter);

export default router;
