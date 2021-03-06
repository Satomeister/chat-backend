const { Schema, model } = require("mongoose");

const DialogSchema = new Schema(
  {
    partner: {
      required: true,
      ref: "user",
      type: Schema.Types.ObjectId,
    },
    admin: {
      required: true,
      ref: "user",
      type: Schema.Types.ObjectId,
    },
    lastMessage: {
      ref: "message",
      type: Schema.Types.ObjectId,
    },
    unreadMessagesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = model("dialog", DialogSchema);
