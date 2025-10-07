import { Router } from "express";
import { getAll, remove, create } from "../services/notification.services.js";

const router = Router();

router.get("/:userId/notifications", getAll);

router.delete("/notifications/:id", remove);

// sockets
// router.post("/notifications", create);

export default router;
