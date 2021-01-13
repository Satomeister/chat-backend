const cloudinary = require("../core/cloudinary");
const UploadFile = require("../models/uploadFile");
const isValidObjectId = require("../utils/isValidObjectId");

class UploadFileController {
  async create(req, res) {
    try {
      const file = req.file;
      const dialogId = req.params.dialogId;

      if (!isValidObjectId(dialogId)) {
        return res.status(400).send();
      }

      cloudinary.v2.uploader
        .upload_stream({ resource_type: "auto" }, async (error, result) => {
          if (error || !result) {
            return res.status(500).json({
              status: "error",
              message: error || "upload error",
            });
          }

          const fileData = {
            filename: result.original_filename,
            size: result.bytes,
            ext: result.format,
            url: result.url,
            user: req.user._id,
            dialog: dialogId,
          };

          const uploadFile = await UploadFile.create(fileData);

          res.json({
            status: "success",
            data: uploadFile,
          });
        })
        .end(file.buffer);
    } catch (error) {
      res.status(500).json({ status: "error", message: error });
    }
  }
}

module.exports = new UploadFileController();
