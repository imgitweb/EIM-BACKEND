// routes/todoRoutes.js
const express = require("express");
const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../controller/todoController");

const router = express.Router();

// GET - Get all todos
router.get("/", getTodos);

// POST - Create a new todo
router.post("/", createTodo);

// PUT - Update a todo
router.put("/:id", updateTodo);

// DELETE - Delete a todo
router.delete("/:id", deleteTodo);

module.exports = router;
