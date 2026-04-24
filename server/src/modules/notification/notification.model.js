const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    notific_id: {
      type: String,
      required: true,
      index: true,
    },
    notifi_type: {
      type: String,
      default: "general",
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

const notification_Model = mongoose.model("notification_", notificationSchema);

module.exports = notification_Model;
