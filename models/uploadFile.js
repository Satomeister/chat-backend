const { Schema, model } = require("mongoose");

const UploadFileSchema = new Schema(
  {
    dialog: {
      required: true,
      ref: "dialog",
      type: Schema.Types.ObjectId,
    },
    filename: String,
    size: Number,
    ext: String,
    url: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = model("uploadFile", UploadFileSchema);
