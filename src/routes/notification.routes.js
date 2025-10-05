import { Router } from "express";
import { getAll, remove } from "../services/notification.services.js";

const router = Router();

router.get("/:userId/notifications", getAll);

router.delete("/notifications/:id", remove);

export default router;
