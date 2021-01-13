const Dialog = require("../models/dialog");
const Message = require("../models/message");
const isValidObjectId = require("../utils/isValidObjectId");

class DialogController {
  constructor(io) {
    this.io = io;
    this.io.on("connection", (socket) => {
      this.socket = socket;
    });
  }

  index = async (req, res) => {
    try {
      await Dialog.deleteMany({ lastMessage: null });

      const dialogs = await Dialog.find({
        $or: [{ admin: req.user._id }, { partner: req.user._id }],
      }).populate("admin partner lastMessage");

      res.json({
        status: "success",
        data: dialogs,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", message: error });
    }
  };

  async getDialog(req, res) {
    try {
      const dialogId = req.params.dialogId;

      if (!isValidObjectId(dialogId)) {
        return res.status(400).send();
      }

      const dialog = await Dialog.findById(dialogId).populate("admin partner");

      const messages = await Message.find({ dialog: dialogId }).populate({
        path: "dialog",
        populate: {
          path: "partner admin",
        },
      });

      res.json({
        status: "success",
        data: {
          dialog,
          messages,
        },
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error });
    }
  }

  async create(req, res) {
    try {
      const data = {
        partner: req.params.partnerId,
      };

      if (!isValidObjectId(data.partner)) {
        return res.status(400).send();
      }

      const candidate = await Dialog.findOne({
        partner: data.partner,
        admin: req.user._id,
      });

      if (candidate) {
        return res
          .status(400)
          .json({ status: "error", message: "Dialog already exists" });
      }

      let dialog = await Dialog.create({
        partner: data.partner,
        admin: req.user._id,
      });

      dialog = await dialog.populate("admin partner").execPopulate();

      res.json({
        status: "success",
        data: {
          dialog,
        },
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error });
    }
  }
}

module.exports = DialogController;
