const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
let cocoModel,
  warningCount = 0,
  examActive = false,
  stream = null;
let detectionInterval = null;

async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  cocoModel = await cocoSsd.load();
}

async function startCamera(videoEl) {
  stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  videoEl.srcObject = stream;
  await new Promise((r) => (videoEl.onloadedmetadata = r));
  videoEl.play();
}

function stopCamera() {
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null;
}

const PROHIBITED = ["cell phone", "book", "laptop", "tablet", "remote"];

async function detectFrame(videoEl) {
  if (!examActive) return;

  const faces = await faceapi.detectAllFaces(
    videoEl,
    new faceapi.TinyFaceDetectorOptions(),
  );

  if (faces.length === 0) await triggerWarning("no_face", "No face detected");
  else if (faces.length > 1)
    await triggerWarning("multiple_faces", "Multiple faces detected");

  const objects = await cocoModel.detect(videoEl);
  for (const obj of objects) {
    if (PROHIBITED.includes(obj.class) && obj.score > 0.6) {
      await triggerWarning(
        "prohibited_object",
        `Prohibited item: ${obj.class}`,
      );
      break;
    }
  }
}

async function triggerWarning(type, message) {
  warningCount++;
  updateWarningUI();
  showWarningPopup(message, warningCount);

  const canvas = document.createElement("canvas");
  const v = document.getElementById("proctor-video");
  canvas.width = v.videoWidth;
  canvas.height = v.videoHeight;
  canvas.getContext("2d").drawImage(v, 0, 0);
  const screenshot = canvas.toDataURL("image/jpeg", 0.6);

  await fetch("/proctoring/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: window.EXAM_ID,
      type,
      warningNum: warningCount,
      details: message,
      screenshot,
    }),
  });

  if (warningCount >= 3) endExam();
}

function updateWarningUI() {
  const el = document.getElementById("warning-counter");
  if (el) el.textContent = `Warnings: ${warningCount}/3`;
}

function showWarningPopup(msg, count) {
  const popup = document.getElementById("warning-popup");
  if (!popup) return;
  popup.textContent =
    count >= 3
      ? "Final warning — exam submitted automatically."
      : `Warning ${count}/3: ${msg}`;
  popup.style.display = "block";
  setTimeout(() => (popup.style.display = "none"), 4000);
}

document.addEventListener("visibilitychange", () => {
  if (examActive && document.hidden)
    triggerWarning("tab_switch", "Student switched tab or window");
});

function endExam() {
  window.ProctoringSystem.stopMonitoring();
  document.getElementById("examForm")?.submit();
}

window.ProctoringSystem = {
  async init(videoEl) {
    await loadModels();
    await startCamera(videoEl);
  },

  startMonitoring(videoEl) {
    examActive = true;
    detectionInterval = setInterval(() => detectFrame(videoEl), 1500);
  },

  stopMonitoring() {
    examActive = false;
    clearInterval(detectionInterval);
    stopCamera();
  },
};
