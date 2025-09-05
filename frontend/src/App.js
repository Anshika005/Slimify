import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [downloadLink, setDownloadLink] = useState(""); 
  const [sizeInfo, setSizeInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a file first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setDownloadLink("");
    setSizeInfo(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${backendUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setMessage("✅ File processed successfully!");
      setDownloadLink(data.downloadUrl);
      setSizeInfo({
        original: data.originalSize,
        compressed: data.compressedSize,
        reduction: data.reductionPercent,
      });
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "60px",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#222", fontSize: "2.5rem", marginBottom: "10px" }}>
        📦 Slimify
      </h1>
      <p style={{ color: "#555", fontSize: "1.1rem", marginBottom: "25px" }}>
        Upload your <b>image</b> or <b>PDF</b> and instantly get a compressed version.
      </p>

      <div
        style={{
          display: "inline-block",
          padding: "25px 30px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          background: "#fff",
        }}
      >
        <input type="file" name="file" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            marginLeft: "12px",
            padding: "10px 18px",
            border: "none",
            borderRadius: "6px",
            background: loading ? "#aaa" : "#007bff",
            color: "#fff",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "⏳ Uploading..." : "Upload & Compress"}
        </button>

        {message && (
          <p
            style={{
              marginTop: "15px",
              fontWeight: "bold",
              color: message.includes("❌") ? "red" : "green",
            }}
          >
            {message}
          </p>
        )}

        {sizeInfo && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              background: "#f9f9f9",
              textAlign: "left",
            }}
          >
            <p>📏 <b>Original Size:</b> {formatSize(sizeInfo.original)}</p>
            <p>📉 <b>Compressed Size:</b> {formatSize(sizeInfo.compressed)}</p>
            <p>💡 <b>Reduction:</b> {sizeInfo.reduction.toFixed(2)}%</p>
          </div>
        )}

        {downloadLink && (
          <a
            href={downloadLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 16px",
              background: "green",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            ⬇️ Download Compressed File
          </a>
        )}
      </div>
    </div>
  );
}

export default App;
