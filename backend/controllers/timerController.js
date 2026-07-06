import { v4 as uuidv4 } from "uuid";
import Timer from "../models/Timer.js";

export const createTimer = async (req, res) => {
  try {
    const timer = await Timer.create({
      id: uuidv4(),
      duration_ms: req.body.duration_ms,
      scramble: req.body.scramble || "",
      created_at: new Date().toISOString(),
    });

    res.json(timer);
  } catch (err) {
    res.status(500).json({
      detail: err.message,
    });
  }
};

export const getTimers = async (req, res) => {
  try {
    const timers = await Timer.find().sort({ created_at: -1 });

    res.json(timers);
  } catch (err) {
    res.status(500).json({
      detail: err.message,
    });
  }
};

export const deleteTimer = async (req, res) => {
  try {
    await Timer.deleteOne({
      id: req.params.id,
    });

    res.json({
      deleted: 1,
    });
  } catch (err) {
    res.status(500).json({
      detail: err.message,
    });
  }
};