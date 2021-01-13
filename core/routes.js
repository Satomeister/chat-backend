const { register: registerValidation } = require("../utils/validators");
const multer = require("./multer");
const passport = require("./passport");

module.exports = createRoutes = (app, io) => {
  const UserCtrl = require("../controllers/UserController");
  const UserController = new UserCtrl(io);
  const DialogCtrl = require("../controllers/DialogController");
  const DialogController = new DialogCtrl(io);
  const MessageCtrl = require("../controllers/MessageController");
  const MessageController = new MessageCtrl(io);
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
  // TODO: prohibit to create dialog with you
  app.post(
    "/dialog/:partnerId",
    passport.authenticate("jwt"),
    DialogController.create
  );

  // app.get(
  //   "/messages/:dialogId",
  //   passport.authenticate("jwt"),
  //   MessageController.index
  // );
  app.post("/message", passport.authenticate("jwt"), MessageController.create);

  app.post(
    "/file/:dialogId",
    passport.authenticate("jwt"),
    multer.single("file"),
    UploadFileController.create
  );
};
