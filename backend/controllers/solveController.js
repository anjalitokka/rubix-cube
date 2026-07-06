import { v4 as uuidv4 } from "uuid";
import kociemba from "kociemba";
import Solve from "../models/Solve.js";

export const solveCube = async (req, res) => {
  try {
    let { facelets } = req.body;

    if (!facelets) {
      return res.status(400).json({
        detail: "facelets required",
      });
    }

    facelets = facelets.trim().toUpperCase();

    if (!/^[URFDLB]{54}$/.test(facelets)) {
      return res.status(400).json({
        detail: "facelets must be 54 chars of URFDLB",
      });
    }
    const SOLVED = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

    if (facelets === SOLVED) {
      return res.json({
        solution: "Already solved",
        moves: [],
        move_count: 0,
      });
    }

    const solution = kociemba.solve(facelets);

    const moves = solution
      .trim()
      .split(" ")
      .filter(Boolean);

    return res.json({
      solution,
      moves,
      move_count: moves.length,
    });

  } catch (err) {

    return res.status(400).json({
      detail: `Unsolvable cube state: ${err.message}`,
    });

  }
};

export const saveSolve = async (req, res) => {

  try {
    console.log(req.body);
    const solve = await Solve.create({

      id: uuidv4(),
      facelets: req.body.facelets,
      solution: req.body.solution,
      move_count: req.body.move_count,
      input_method: req.body.input_method || "manual",
      created_at: new Date().toISOString()

    });

    res.json(solve);

  }

  catch (err) {

    res.status(500).json({

      detail: err.message

    });

  }

};

export const getSolves = async (req, res) => {

  try {

    const solves = await Solve.find({})
      .sort({ created_at: -1 })
      .select("-_id -__v");

    res.json(solves);

  } catch (err) {

    res.status(500).json({
      detail: err.message,
    });

  }

};

export const deleteSolve = async (req, res) => {
  try {
    const result = await Solve.deleteOne({
      id: req.params.id,
    });

    res.json({
      deleted: result.deletedCount,
    });

  } catch (err) {

    res.status(500).json({
      detail: err.message,
    });

  }
};