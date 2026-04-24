const mongoose = require("mongoose");

const whiteboardSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled whiteboard",
    },
    document: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

const whiteboardModel = mongoose.model("whiteboard_", whiteboardSchema);

module.exports = whiteboardModel;
