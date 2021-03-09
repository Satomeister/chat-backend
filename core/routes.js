const { register: registerValidation } = require("../utils/validators");
const multer = require("./multer");
const passport = require("./passport");

module.exports = createRoutes = (app) => {
  const UserController = require("../controllers/UserController");
  const DialogController = require("../controllers/DialogController");
  const MessageController = require("../controllers/MessageController");
  const UploadFileController = require("../controllers/UploadFileController");

  app.post("/signup", registerValidation, UserController.create);
  app.post("/login", UserController.login);
  app.get("/me", passport.authenticate("jwt"), UserController.getMe);

  app.get("/users", passport.authenticate("jwt"), UserController.index);

  app.get(
    "/dialog/:dialogId",
    passport.authenticate("jwt"),
    DialogController.getDialog
  );
  app.get("/dialogs", passport.authenticate("jwt"), DialogController.index);

  app.post(
    "/dialog/:partnerId",
    passport.authenticate("jwt"),
    DialogController.create
  );

  app.get(
    "/messages/:dialogId",
    passport.authenticate("jwt"),
    MessageController.getNewMessagesChunk
  );
  app.post("/message", passport.authenticate("jwt"), MessageController.create);
  app.put(
    "/message/:messageId",
    passport.authenticate("jwt"),
    MessageController.updateReadStatus
  );

  app.post(
    "/file/:dialogId",
    passport.authenticate("jwt"),
    multer.single("file"),
    UploadFileController.create
  );
};
