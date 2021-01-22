const Message = require("../models/message");
const Dialog = require("../models/dialog");
const isValidObjectId = require("../utils/isValidObjectId");

class MessageController {
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
        attachments: req.body.attachments,
        sender: req.user,
      };

      if (!isValidObjectId(data.dialog)) {
        return res.status(400).send();
      }

      if (!data.text && !data.attachments) {
        res.status(400).json({ status: "error", message: "No message data" });
      }

      let message = await Message.create(data);

      message
        .populate("dialog sender", "admin partner name avatar")
        .execPopulate();
      const dialog = await Dialog.findById(data.dialog).populate(
        "admin partner"
      );
      dialog.lastMessage = message._id;
      dialog.unreadMessagesCount = +dialog.unreadMessagesCount + 1;
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

  async getNewMessagesChunk(req, res) {
    try {
      const data = {
        dialogId: req.params.dialogId,
        messagesCount: +req.query.count,
      };

      const messages = await Message.find({ dialog: data.dialogId })
        .populate([
          {
            path: "dialog",
            populate: {
              path: "partner admin",
            },
          },
          {
            path: "sender",
          },
        ])
        .sort({ createdAt: "-1" })
        .skip(data.messagesCount)
        .limit(+process.env.MESSAGES_CHUNK);

      res.json({
        status: "success",
        data: messages,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", message: error });
    }
  }

  async updateReadStatus(req, _) {
    const messageId = req.params.messageId;

    const message = await Message.findById(messageId);
    message.read = true;
    message.save();
  }
}

module.exports = new MessageController();
