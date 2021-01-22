const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const passport = require("../core/passport");
const User = require("../models/user");
const getAvatarColor = require("../utils/getAvatarColor");

class UserController {
  async index(req, res) {
    try {
      const value = req.query.user;

      const users = await User.find({
        $or: [
          { email: new RegExp(value, "i") },
          { name: new RegExp(value, "i") },
        ],
        _id: { $ne: req.user._id },
      });

      res.json({
        status: "success",
        data: users,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", message: error });
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          status: "error",
          errors,
        });
      }

      const data = {
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
      };

      const candidate = await User.findOne({
        $or: [{ name: data.name }, { email: data.email }],
      });

      if (candidate) {
        return res
          .status(400)
          .json({ status: "error", message: "Such user already exists" });
      }

      const user = await User.create(data);
      user.avatar = getAvatarColor(user._id);
      await user.save();

      const userData = user.toJSON();

      res.json({
        status: "success",
        data: {
          ...userData,
          token: jwt.sign({ data: user }, `'${process.env.JWT_SECRET}'`, {
            expiresIn: "7d",
          }),
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async login(req, res, next) {
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: info.message,
        });
      }

      const userData = user.toJSON();

      return res.json({
        status: "success",
        data: {
          ...userData,
          token: jwt.sign({ data: user }, `'${process.env.JWT_SECRET}'`, {
            expiresIn: "7d",
          }),
        },
      });
    })(req, res, next);
  }

  async getMe(req, res) {
    try {
      const user = req.user.toJSON();
      return res.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async updateOnlineStatus(isOnline, userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.isOnline = isOnline;
        user.save();
      }
      return user;
    } catch (error) {}
  }
}

module.exports = new UserController();
