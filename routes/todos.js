var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../controllers/authMiddleware");

const Todo = require("../models/Todo");
const User = require("../models/User");

router.get("/", (req, res) => {
  res.send("<h1>Welcome todo</h1>");
});

/**
 * GET All todo Lists
 * @PrivateRoute
 */
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const userData = await User.findById(req.user);
    if (!userData) {
      res.status(403).json({ Error: "Authentication Failed" });
    }

    const todoList = await Todo.find({ user: req.user });
    res.status(200).json({ Success: todoList });
  } catch (err) {
    res.status(500).json({ Error: "Unable to get todo list" });
  }
});

/**
 * Add a new Todo
 * @PrivateRoute
 */
router.post(
  "/",
  authMiddleware,
  [
    body("task", "Enter a Valid Task Description")
      .notEmpty()
      .isString(),
    body("timestamp", "Enter a valid date-timestamp")
      .isISO8601()
      .toDate()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("reg", {
        display: true,
        message: errors.array()[0].msg
      });
    }
    try {
      const userData = await User.findById(req.user);
      if (!userData) {
        res.status(403).json({ Error: "Authentication Failed" });
      }

      const newTask = new Todo({
        task: req.body.task,
        timestamp: req.body.timestamp,
        user: req.user
      });

      await newTask.save();
      res.status(200).json({ Success: "Todo is Created" });
    } catch (err) {
      res.status(500).json({ Error: "Unable to post the task" });
    }
  }
);

/**
 * Update a Todo
 * @PrivateRoute
 */
router.put(
  "/:id",
  authMiddleware,
  [
    body("task", "Enter a Valid Task Description")
      .notEmpty()
      .isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("reg", {
        display: true,
        message: errors.array()[0].msg
      });
    }
    try {
      const userData = await User.findById(req.user);
      if (!userData) {
        return res.status(403).json({ Error: "Authentication Failed" });
      }

      const result = await Todo.findByIdAndUpdate(req.params.id, {
        $set: { task: req.body.task }
      });
      if (!result) {
        return res.status(400).json({ Error: "There is no Such Todo's" });
      }

      res.status(200).json({ Success: "Todo is Updated" });
    } catch (err) {
      res.status(500).json({ Error: "Unable to update the task" });
    }
  }
);

/**
 * Delete a Todo
 * @PrivateRoute
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userData = await User.findById(req.user);
    if (!userData) {
      res.status(403).json({ Error: "Authentication Failed" });
    }

    const result = await Todo.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(400).json({ Error: "There is no Such Todo's" });
    }

    res.status(200).json({ Success: "Todo is deleted" });
  } catch (err) {
    res.status(500).json({ Error: "Unable to delete the task" });
  }
});

module.exports = router;
