const { body } = require("express-validator");

module.exports = {
  register: [
    body("email")
      .not()
      .isEmpty()
      .withMessage("Please enter an email")
      .isEmail()
      .withMessage("Email is invalid")
      .trim(),
    body("name")
      .not()
      .isEmpty()
      .withMessage("Please enter a name")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Name must be at least 4 characters")
      .isLength({ max: 40 })
      .withMessage("Name must be less than 40 characters"),
    body("password", "Please enter a password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
};
