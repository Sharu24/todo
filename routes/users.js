/**
 * User Route
 */
var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const config = require("../config");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

/**
 * User Registration form
 * @method: GET
 */
router.get("/signup", (req, res) => {
  res.render("reg");
});

/**
 * User Registration form
 * @method: POST
 */
router.post(
  "/signup",
  [
    body("fullname", "Full Name is required")
      .notEmpty()
      .isString(),
    body("email", "Enter a valid Email Address").isEmail(),
    body("password", "Password should be more than 6 characters").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("reg", {
          display: true,
          message: errors.array()[0].msg
        });
      }
      const { email, fullname } = req.body;
      let userData = await User.findOne({ email: email });
      if (userData) {
        return res.render("reg", {
          display: true,
          message: "Email Address Already Registered"
        });
      }
      const salt = await bcrypt.genSalt(15);
      const password = await bcrypt.hash(req.body.password, salt);
      userData = new User({ fullname, email, password });
      await userData.save();
      res.redirect("/users/login");
    } catch (err) {
      res.status(500).json({ Error: "Unable to register" });
    }
  }
);

/**
 * User Login form
 * @method: GET
 */
router.get("/login", (req, res) => {
  res.render("login", { display: false });
});

/**
 * User Login form
 * @method: POST
 */
router.post(
  "/login",
  [
    body("email", "Enter a valid Email Address").isEmail(),
    body("password", "Enter a valid Password").isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("login", {
          display: true,
          message: errors.array()[0].msg
        });
      }
      const { email, password } = req.body;
      const userData = await User.findOne({ email: email });
      if (!userData) {
        return res.render("login", {
          display: true,
          message: "User does not exist"
        });
      }
      const isValid = await bcrypt.compare(password, userData.password);
      if (!isValid) {
        return res.render("login", {
          display: true,
          message: "Incorrect Password"
        });
      }

      const payload = {
        user: userData._id
      };
      const token = await jwt.sign(payload, config.SECRET_KEY, {
        expiresIn: 600
      });
      console.log(token);

      res.redirect("/");
    } catch (err) {
      res.status(500).json({ Error: "Unable to Process Login" });
    }
  }
);

module.exports = router;
