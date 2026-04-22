const express = require("express");
const router = express.Router();
const ProctoringLog = require("../models/ProctoringLog");

// Save a violation log (called automatically by proctor.js)
router.post("/log", async (req, res) => {
  try {
    const { examId, type, screenshot, warningNum, details } = req.body;
    await ProctoringLog.create({
      examId,
      userId: req.user._id,
      type,
      screenshot,
      warningNum,
      details,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: view logs for a specific exam
router.get("/logs/:examId", async (req, res) => {
  const logs = await ProctoringLog.find({ examId: req.params.examId }).populate(
    "userId",
    "name email",
  );
  res.json(logs);
});

module.exports = router;
