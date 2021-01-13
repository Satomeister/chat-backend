const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    dialog: {
      required: true,
      ref: "dialog",
      type: Schema.Types.ObjectId,
    },
    sender: {
      required: true,
      ref: "user",
      type: Schema.Types.ObjectId,
    },
    text: String,
    read: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: "uploadFile",
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("message", MessageSchema);
