const Message = require("../models/messageModel");

const createMessage = async (req, res) => {
  try {
    const { name, email, mobile, message } = req.body;

    const newMessage = new Message({
      name,
      email,
      mobile,
      message,
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage); // 201 Created status code
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" }); // 500 Internal Server Error
  }
};

// Get all Messages (Optional - for demonstration/admin panel)
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { createMessage, getAllMessages }; // Export the functions
