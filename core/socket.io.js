const UserController = require("../controllers/UserController");
const DialogController = require("../controllers/DialogController");

module.exports = function (app) {
  const http = require("http").Server(app);

  const io = require("socket.io")(http, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "DELETE"],
    },
  });
  const rooms = [];
  io.on("connection", (socket) => {
    socket.on("ROOM:JOIN", (id) => {
      socket.join(id);
      if (!rooms.includes(id)) {
        rooms.push(id);
      }
      io.to(id).emit("ROOM:JOINED", id);
    });

    socket.on("DIALOG:CREATE_DIALOG", (dialog) => {
      const dialogId = dialog._id;
      rooms.push(dialogId);
      socket.join(dialogId);
      socket.broadcast.emit("DIALOG:NEW_DIALOG", dialog);
    });

    socket.on("MESSAGE:NEW_MESSAGE", ({ roomId, message, dialog }) => {
      socket.broadcast
        .to(roomId)
        .emit("MESSAGE:SEND_MESSAGE", { message, dialog });
    });

    socket.on("USER:UPDATE_ONLINE_STATUS", async (isOnline, userId) => {
      const user = await UserController.updateOnlineStatus(isOnline, userId);

      rooms.forEach((room) => {
        socket.broadcast.to(room).emit("USER:NEW_STATUS", isOnline, user);
      });
    });
    socket.on("MESSAGE:READ", async (room, userId) => {
      await DialogController.setUnreadMessagesCount(room, userId);
      socket.broadcast.to(room).emit("MESSAGE:IS_READ", room);
    });
  });

  return { http };
};
