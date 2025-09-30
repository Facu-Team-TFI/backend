import { Router } from "express";
import { getAll, remove } from "../services/notification.services.js";

const router = Router();

router.get("/notifications/:userId", getAll);

router.delete("/notifications/:id", remove);

export default router;
