import express from "express";

import {

solveCube,

saveSolve,

getSolves,

deleteSolve

} from "../controllers/solveController.js";

const router=express.Router();

router.post("/solve",solveCube);

router.post("/solves",saveSolve);

router.get("/solves",getSolves);

router.delete("/solves/:id",deleteSolve);

export default router;