import express from "express";

import { detectFace } from "../controllers/detectController.js";

const router = express.Router();

router.post("/detect-face", detectFace);

export default router;