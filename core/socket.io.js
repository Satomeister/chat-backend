module.exports = function (app) {
  const http = require("http").Server(app);

  const io = require("socket.io")(http, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("ROOM:JOIN", (id) => {
      socket.join(id);
      io.to(id).emit("ROOM:JOINED", "status: success");
    });

    socket.on("MESSAGE:NEW_MESSAGE", ({ roomId, message }) => {
      socket.to(roomId).emit("MESSAGE:SEND_MESSAGE", message);
    });
  });

  return { http, io };
};
