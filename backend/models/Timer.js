import mongoose from "mongoose";

const timerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },

  duration_ms: {
    type: Number,
    required: true,
  },

  scramble: {
    type: String,
    default: "",
  },

  created_at: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

export default mongoose.model("Timer", timerSchema);