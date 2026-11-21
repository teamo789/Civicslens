const path = require("path");
const multer = require("multer");
const { randomUUID } = require("crypto");
const { getComplaints, saveComplaints } = require("../services/storageService");
const { analyseComplaint } = require("../services/aiAnalysisService");
const { findDuplicate } = require("../services/duplicateService");
const { getDepartmentForCategory } = require("../services/departmentService");

const uploadDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${randomUUID()}-${safeName}`);
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      const error = new Error("Only JPG, PNG and WebP images are allowed");
      error.status = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

function severityRank(severity) {
  return { Critical: 4, High: 3, Medium: 2, Low: 1 }[severity] || 0;
}

function ticketId() {
  return `CL-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

async function createComplaint(req, res) {
  const text = req.body.text || req.body.description || req.body.complaint;
  const location = req.body.location;
  if (!text || !String(text).trim()) {
    return res.status(400).json({ success: false, error: "Complaint text is required" });
  }
  if (!location || !String(location).trim()) {
    return res.status(400).json({ success: false, error: "Location is required" });
  }

  const complaints = getComplaints();
  const analysis = await analyseComplaint(String(text).trim());
  const department = getDepartmentForCategory(analysis.category);
  const imageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : (typeof req.body.image === "string" ? req.body.image : null);

  const complaint = {
    id: randomUUID(),
    ticketId: ticketId(),
    text: String(text).trim(),
    location: String(location).trim(),
    imageUrl,
    userId: req.user.sub,
    submittedBy: req.user.name,
    status: "Pending",
    category: analysis.category,
    severity: analysis.severity,
    severityExplanation: analysis.severityExplanation,
    responsibleDepartment: department,
    summary: analysis.summary,
    priorityScore: analysis.priorityScore,
    suggestedAction: analysis.suggestedAction,
    detectedLanguage: analysis.detectedLanguage,
    analysisMethod: analysis.analysisMethod,
    possibleDuplicateOf: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const duplicate = findDuplicate(complaints, complaint);
  if (duplicate) complaint.possibleDuplicateOf = duplicate.id;
  complaints.push(complaint);
  saveComplaints(complaints);

  res.status(201).json({
    success: true,
    data: {
      ...complaint,
      possibleDuplicate: Boolean(duplicate),
    },
  });
}

function listComplaints(req, res) {
  let complaints = getComplaints();
  if (req.user.role === "CITIZEN") {
    complaints = complaints.filter((item) => item.userId === req.user.sub);
  }
  complaints.sort((a, b) => {
    const severityDifference = severityRank(b.severity) - severityRank(a.severity);
    return severityDifference || (b.priorityScore || 0) - (a.priorityScore || 0);
  });
  res.json({ success: true, data: complaints });
}

function getComplaint(req, res) {
  const complaint = getComplaints().find((item) => item.id === req.params.id);
  if (!complaint) return res.status(404).json({ success: false, error: "Complaint not found" });
  if (req.user.role === "CITIZEN" && complaint.userId !== req.user.sub) {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }
  res.json({ success: true, data: complaint });
}

function updateStatus(req, res) {
  const allowed = ["Pending", "In Progress", "Resolved"];
  const status = req.body.status;
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, error: "Status must be Pending, In Progress or Resolved" });
  }
  const complaints = getComplaints();
  const complaint = complaints.find((item) => item.id === req.params.id);
  if (!complaint) return res.status(404).json({ success: false, error: "Complaint not found" });
  complaint.status = status;
  complaint.updatedAt = new Date().toISOString();
  if (status === "Resolved") complaint.resolvedAt = complaint.updatedAt;
  if (status !== "Resolved") delete complaint.resolvedAt;
  saveComplaints(complaints);
  res.json({ success: true, data: complaint });
}

function reopenComplaint(req, res) {
  const complaints = getComplaints();
  const complaint = complaints.find((item) => item.id === req.params.id);
  if (!complaint) return res.status(404).json({ success: false, error: "Complaint not found" });
  complaint.status = "In Progress";
  complaint.updatedAt = new Date().toISOString();
  delete complaint.resolvedAt;
  saveComplaints(complaints);
  res.json({ success: true, data: complaint });
}

function assignDepartment(req, res) {
  const department = String(req.body.department || "").trim();
  if (!department) return res.status(400).json({ success: false, error: "department is required" });
  const complaints = getComplaints();
  const complaint = complaints.find((item) => item.id === req.params.id);
  if (!complaint) return res.status(404).json({ success: false, error: "Complaint not found" });
  complaint.responsibleDepartment = department;
  complaint.updatedAt = new Date().toISOString();
  saveComplaints(complaints);
  res.json({ success: true, data: complaint });
}

function deleteComplaint(req, res) {
  const complaints = getComplaints();
  const index = complaints.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: "Complaint not found" });
  complaints.splice(index, 1);
  saveComplaints(complaints);
  res.json({ success: true, data: { deletedId: req.params.id } });
}

module.exports = {
  imageUpload,
  createComplaint,
  listComplaints,
  getComplaint,
  updateStatus,
  reopenComplaint,
  assignDepartment,
  deleteComplaint,
};
