const express = require('express');
const router = express.Router();
const Message = require('../models/message.model');

router.get('/:slug/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Fetch messages for this project, sorted by oldest to newest
    const messages = await Message.find({ projectId }).sort({ createdAt: 1 });
    
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
