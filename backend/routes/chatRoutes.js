const express = require("express");
const router = express.Router();
const { deepseekChat } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ message: "El mensaje es requerido" });

    const response = await deepseekChat(message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
