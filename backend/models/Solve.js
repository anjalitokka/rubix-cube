import mongoose from "mongoose";

const SolveSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },

    facelets: {
      type: String,
      required: true,
    },

    solution: {
      type: String,
      default: "",
    },

    move_count: {
      type: Number,
      default: 0,
    },

    input_method: {
      type: String,
      enum: ["manual", "scan"],
      default: "manual",
    },

    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("Solve", SolveSchema, "solves");