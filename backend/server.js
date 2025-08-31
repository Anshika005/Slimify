/*require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

// -------- Middleware --------
app.use(cors());
app.use(express.json());

// -------- Root Route --------
app.get("/", (req, res) => {
  res.send("🟢 Server is running. Use POST /upload to compress files.");
});

// -------- Static Files --------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public"))); // optional public folder

// -------- Multer Setup --------
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// -------- MongoDB Schema --------
const CompressionSchema = new mongoose.Schema({
  originalName: String,
  compressedName: String,
  originalSize: Number,
  compressedSize: Number,
  reductionPercent: Number,
  createdAt: { type: Date, default: Date.now },
});
const Compression = mongoose.model("Compression", CompressionSchema);

// -------- PDF Compression --------
function compressPdf(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const gsCommand =
      process.env.GS_PATH ||
      (process.platform === "win32"
        ? "C:\\Program Files\\gs\\gs10.05.1\\bin\\gswin64c.exe"
        : "gs");

    const args = [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/ebook",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ];

    const gs = spawn(gsCommand, args);
    let errorOutput = "";

    gs.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    gs.on("close", (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`Ghostscript failed (code ${code}): ${errorOutput}`));
    });
  });
}

// -------- Image Compression --------
async function compressImage(inputPath, outputPath) {
  try {
    await sharp(inputPath).jpeg({ quality: 60 }).toFile(outputPath);
    return outputPath;
  } catch (error) {
    throw new Error("Image compression failed: " + error.message);
  }
}

// -------- Upload & Compress Route --------
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const file = req.file;
  const originalPath = file.path;
  const compressedName = `${Date.now()}_compressed_${file.originalname}`;
  const compressedPath = path.join("uploads", compressedName).replace(/\\/g, "/");

  try {
    let finalPath;

    if (file.mimetype === "application/pdf") {
      finalPath = await compressPdf(originalPath, compressedPath);
    } else if (file.mimetype.startsWith("image/")) {
      finalPath = await compressImage(originalPath, compressedPath);
    } else {
      fs.unlinkSync(originalPath);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const originalSize = fs.statSync(originalPath).size / 1024; // KB
    const compressedSize = fs.statSync(finalPath).size / 1024; // KB
    const reductionPercent = ((originalSize - compressedSize) / originalSize) * 100;

    fs.unlinkSync(originalPath); // delete original

    // Save to MongoDB with compressed name
    await Compression.create({
      originalName: file.originalname,
      compressedName,
      originalSize,
      compressedSize,
      reductionPercent,
    });

    res.json({
      message: "File processed successfully!",
      originalSize: originalSize.toFixed(2),
      compressedSize: compressedSize.toFixed(2),
      reductionPercent: reductionPercent.toFixed(1),
      downloadUrl: `http://localhost:${PORT}/uploads/${compressedName}`
    });
  } catch (error) {
    if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
    if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
    console.error(error);
    res.status(500).json({ error: "Compression failed", details: error.message });
  }
});

// -------- Get all uploaded files --------
app.get("/files", async (req, res) => {
  try {
    const files = await Compression.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// -------- MongoDB Connection --------
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// -------- Start Server --------
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));*/
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

// -------- Middleware --------
app.use(cors());
app.use(express.json());

// -------- Root Route --------
app.get("/", (req, res) => {
  res.send("🟢 Server is running. Use POST /upload to compress files.");
});

// -------- Static Files --------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// -------- Multer Setup --------
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// -------- MongoDB Schema --------
const CompressionSchema = new mongoose.Schema({
  originalName: String,
  compressedName: String,
  originalSize: Number,
  compressedSize: Number,
  reductionPercent: Number,
  createdAt: { type: Date, default: Date.now },
});
const Compression = mongoose.model("Compression", CompressionSchema);

// -------- PDF Compression (Ghostscript) --------
function compressPdf(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const gsCommand =
      process.env.GS_PATH ||
      (process.platform === "win32"
        ? "C:\\Program Files\\gs\\gs10.05.1\\bin\\gswin64c.exe"
        : "gs");

    const args = [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/ebook",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ];

    const gs = spawn(gsCommand, args);
    let errorOutput = "";

    gs.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    gs.on("close", (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`Ghostscript failed (code ${code}): ${errorOutput}`));
    });
  });
}

// -------- Image Compression --------
async function compressImage(inputPath, outputPath) {
  try {
    await sharp(inputPath).jpeg({ quality: 60 }).toFile(outputPath);
    return outputPath;
  } catch (error) {
    throw new Error("Image compression failed: " + error.message);
  }
}

// -------- Upload & Compress Route --------
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const file = req.file;
  const originalPath = file.path;
  const compressedName = `${Date.now()}_compressed_${file.originalname}`;
  const compressedPath = path.join("uploads", compressedName);

  try {
    let finalPath;

    if (file.mimetype === "application/pdf") {
      finalPath = await compressPdf(originalPath, compressedPath);
    } else if (file.mimetype.startsWith("image/")) {
      finalPath = await compressImage(originalPath, compressedPath);
    } else {
      fs.unlinkSync(originalPath);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Get sizes in KB
    const originalSize = fs.statSync(originalPath).size / 1024;
    const compressedSize = fs.statSync(finalPath).size / 1024;
    const reductionPercent = ((originalSize - compressedSize) / originalSize) * 100;

    // Remove the uncompressed original file
    if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);

    // Save in MongoDB
    const savedDoc = await Compression.create({
      originalName: file.originalname,
      compressedName,
      originalSize,
      compressedSize,
      reductionPercent,
    });

    console.log("✅ Saved to MongoDB:", savedDoc);

    res.json({
      message: "File processed successfully!",
      originalSize: originalSize.toFixed(2),
      compressedSize: compressedSize.toFixed(2),
      reductionPercent: reductionPercent.toFixed(2),
      downloadUrl: `http://localhost:${PORT}/uploads/${compressedName}`,
    });
  } catch (error) {
    if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
    if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
    console.error(error);
    res.status(500).json({ error: "Compression failed", details: error.message });
  }
});

// -------- Get all uploaded files --------
app.get("/files", async (req, res) => {
  try {
    const files = await Compression.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// -------- MongoDB Connection --------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
