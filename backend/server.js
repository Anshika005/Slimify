require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const sharp = require("sharp");
const { spawn } = require("child_process");
const { GridFSBucket } = require("mongodb");
const { Readable } = require("stream");

const app = express();
const PORT = process.env.PORT || 5000;
const DOMAIN = process.env.DOMAIN || `http://localhost:${PORT}`;


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🟢 Server is running. Use POST /upload to compress files.");
});

// ---- Multer setup ----
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

// ---- Mongoose Schema ----
const CompressionSchema = new mongoose.Schema({
  originalName: String,
  compressedName: String,
  compressedFileId: mongoose.Schema.Types.ObjectId,
  originalSize: Number,
  compressedSize: Number,
  reductionPercent: Number,
  mimetype: String,
  createdAt: { type: Date, default: Date.now },
});
const Compression = mongoose.model("Compression", CompressionSchema);

let bucket;

// ---- PDF Compression using Ghostscript ----
function compressPdf(inputBuffer) {
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
      "-sOutputFile=-",
      "-",
    ];

    const gs = spawn(gsCommand, args);
    let outputBuffer = Buffer.alloc(0);
    let errorOutput = "";

    gs.stdin.write(inputBuffer);
    gs.stdin.end();

    gs.stdout.on("data", (data) => {
      outputBuffer = Buffer.concat([outputBuffer, data]);
    });

    gs.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    gs.on("close", (code) => {
      if (code === 0) resolve(outputBuffer);
      else reject(new Error(`Ghostscript failed (code ${code}): ${errorOutput}`));
    });
  });
}

// ---- Image Compression using Sharp ----
async function compressImage(inputBuffer) {
  try {
    return await sharp(inputBuffer).jpeg({ quality: 60 }).toBuffer();
  } catch (error) {
    throw new Error("Image compression failed: " + error.message);
  }
}

// ---- GridFS Upload/Download ----
function uploadToGridFS(buffer, filename, mimetype) {
  return new Promise((resolve, reject) => {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { mimetype },
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id));

    readableStream.pipe(uploadStream);
  });
}

function downloadFromGridFS(fileId) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("error", reject);
    downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// ---- Upload Route ----
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const file = req.file;
  const originalBuffer = file.buffer;
  const originalSize = originalBuffer.length / 1024; // KB

  try {
    let compressedBuffer;

    if (file.mimetype === "application/pdf") {
      compressedBuffer = await compressPdf(originalBuffer);
    } else if (file.mimetype.startsWith("image/")) {
      compressedBuffer = await compressImage(originalBuffer);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const compressedSize = compressedBuffer.length / 1024;
    const reductionPercent = ((originalSize - compressedSize) / originalSize) * 100;

    const compressedName = `${Date.now()}_compressed_${file.originalname}`;
    const fileId = await uploadToGridFS(compressedBuffer, compressedName, file.mimetype);

    const savedDoc = await Compression.create({
      originalName: file.originalname,
      compressedName,
      compressedFileId: fileId,
      originalSize: Number(originalSize),
      compressedSize: Number(compressedSize),
      reductionPercent: Number(reductionPercent),
      mimetype: file.mimetype,
    });

    console.log("✅ Saved to MongoDB:", savedDoc);

    res.json({
      message: "File processed successfully!",
      originalSize: Number(originalSize),
      compressedSize: Number(compressedSize),
      reductionPercent: Number(reductionPercent),
      fileId: fileId.toString(),
      downloadUrl: `${DOMAIN}/download/${fileId}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Compression failed", details: error.message });
  }
});

// ---- Download Route ----
app.get("/download/:fileId", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const compressionData = await Compression.findOne({ compressedFileId: fileId });

    if (!compressionData) {
      return res.status(404).json({ error: "File not found" });
    }

    const buffer = await downloadFromGridFS(fileId);

    res.set({
      "Content-Type": compressionData.mimetype,
      "Content-Disposition": `attachment; filename="${compressionData.originalName}"`,
      "Content-Length": buffer.length,
    });

    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Download failed", details: error.message });
  }
});

// ---- List Files Route ----
app.get("/files", async (req, res) => {
  try {
    const files = await Compression.find().sort({ createdAt: -1 });
    const filesWithUrls = files.map((file) => ({
      ...file.toObject(),
      originalSize: Number(file.originalSize),
      compressedSize: Number(file.compressedSize),
      reductionPercent: Number(file.reductionPercent),
      downloadUrl: `${DOMAIN}/download/${file.compressedFileId}`,
    }));
    res.json(filesWithUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// ---- Delete File Route ----
app.delete("/files/:id", async (req, res) => {
  try {
    const compression = await Compression.findById(req.params.id);
    if (!compression) {
      return res.status(404).json({ error: "File not found" });
    }

    await bucket.delete(compression.compressedFileId);
    await Compression.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Delete failed", details: error.message });
  }
});
// ghostscript debug
app.get("/check-gs", (req, res) => {
  const { exec } = require("child_process");
  exec("gs --version", (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send("❌ Ghostscript not found: " + error.message);
    }
    res.send("✅ Ghostscript version: " + stdout);
  });
});

// ---- MongoDB Connection ----
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    app.listen(PORT, () =>
      console.log(`🚀 Server running on ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
