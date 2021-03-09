const Dialog = require("../models/dialog");
const Message = require("../models/message");
const isValidObjectId = require("../utils/isValidObjectId");

class DialogController {
  index = async (req, res) => {
    try {
      await Dialog.findOneAndDelete({ lastMessage: null, admin: req.user._id });

      const dialogs = await Dialog.find({
        $or: [{ admin: req.user._id }, { partner: req.user._id }],
        lastMessage: { $ne: null },
      }).populate([
        { path: "admin" },
        { path: "partner" },
        { path: "lastMessage", populate: { path: "sender" } },
      ]);

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

      const dialog = await Dialog.findOne({
        _id: dialogId,
        $or: [{ partner: req.user._id }, { admin: req.user._id }],
      }).populate("admin partner");

      if (!dialog) {
        return res.status(404).send();
      }

      const messages = await Message.find({ dialog: dialogId })
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
        .limit(+process.env.MESSAGES_CHUNK);

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

      if (data.partner === req.user._id) {
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

  async setUnreadMessagesCount(dialogId, userId) {
    try {
      const unreadMessages = await Message.updateMany(
        {
          dialog: dialogId,
          sender: { $ne: userId },
          read: false,
        },
        { $set: { read: true } }
      );

      if (unreadMessages.nModified) {
        const dialog = await Dialog.findById(dialogId);
        dialog.unreadMessagesCount = 0;
        await dialog.save();
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new DialogController();
