// controllers/todoController.js
const Todo = require("../models/todoModel");

// Get all todos
const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new todo
// controllers/todoController.js
const createTodo = async (req, res) => {
  try {
    const { task, startup_id } = req.body;

    if (!startup_id) {
      return res.status(400).json({ message: "Startup ID is required" });
    }

    const newTodo = new Todo({
      task,
      startup_id, // Save startup_id with the to-do item
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a todo
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { task, completed } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { task, completed },
      { new: true }
    );
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a todo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    await Todo.findByIdAndDelete(id);
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
