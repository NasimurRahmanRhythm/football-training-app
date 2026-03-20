import mongoose from "mongoose";
import { SESSION_TYPES } from "@/lib/enums";

const PlayerPerformanceSchema = new mongoose.Schema({
  mongoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  goals: {
    type: Number,
    default: 0,
  },
  assists: {
    type: Number,
    default: 0,
  },
  cleansheet: {
    type: Boolean,
    default: false,
  },
});

const DrillPlayerSchema = new mongoose.Schema({
  mongoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
});

const DrillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  players: [DrillPlayerSchema],
});

const SessionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(SESSION_TYPES),
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    opponent: {
      type: String,
      trim: true,
      default: null,
    },
    players: [PlayerPerformanceSchema], // Used for MATCH type
    drills: [DrillSchema], // Used for TRAINING type
  },
  {
    timestamps: true,
  },
);

const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);

export default Session;
