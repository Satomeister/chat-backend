const cloudinary = require("../core/cloudinary");
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

          res.json({
            status: "success",
            data: result.url,
          });
        })
        .end(file.buffer);
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", message: error });
    }
  }
}

module.exports = new UploadFileController();
