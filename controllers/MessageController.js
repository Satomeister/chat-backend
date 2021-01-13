const Message = require("../models/message");
const Dialog = require("../models/dialog");
const isValidObjectId = require("../utils/isValidObjectId");

class MessageController {
  constructor(io) {
    this.io = io;
    this.io.on("connection", (socket) => {
      this.socket = socket;
    });
  }

  // async index(req, res) {
  //   try {
  //     const data = {
  //       dialog: req.params.dialogId,
  //     };
  //
  //     if (!isValidObjectId(data.dialog)) {
  //       return res.status(400).send();
  //     }
  //
  //     const messages = await Message.find({ dialog: data.dialog }).populate({
  //       path: "dialog",
  //       populate: {
  //         path: "partner admin",
  //       },
  //     });
  //
  //     res.json({
  //       status: "success",
  //       data: messages,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ status: "error", message: error });
  //   }
  // }

  create = async (req, res) => {
    try {
      const data = {
        dialog: req.body.dialog,
        text: req.body.text,
        attachments: req.attachments,
        sender: req.user._id,
      };

      if (!isValidObjectId(data.dialog)) {
        return res.status(400).send();
      }

      if (!data.text && !data.attachments) {
        res.status(400).json({ status: "error", message: "No message data" });
      }

      let message = await Message.create(data);

      message.populate("dialog attachments", "partner admin").execPopulate();

      const dialog = await Dialog.findById(data.dialog).populate(
        "admin partner"
      );
      dialog.lastMessage = message._id;
      dialog.messagesCount = dialog.messagesCount + 1;
      await dialog.save();

      res.json({
        status: "success",
        data: { message, dialog: { ...dialog._doc, lastMessage: message } },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", message: error });
    }
  };
}

module.exports = MessageController;
