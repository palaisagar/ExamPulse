const mongoose = require("mongoose");

const proctoringLogSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["no_face", "multiple_faces", "prohibited_object", "tab_switch"],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  screenshot: { type: String },
  warningNum: { type: Number },
  details: { type: String },
});

module.exports = mongoose.model("ProctoringLog", proctoringLogSchema);
