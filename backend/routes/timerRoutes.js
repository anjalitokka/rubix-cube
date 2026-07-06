import express from "express";

import {
  createTimer,
  getTimers,
  deleteTimer,
} from "../controllers/timerController.js";

const router = express.Router();

router.post("/timer", createTimer);

router.get("/timer", getTimers);

router.delete("/timer/:id", deleteTimer);

export default router;