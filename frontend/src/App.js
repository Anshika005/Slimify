import React, { useState, useEffect } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [sizeInfo, setSizeInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allFiles, setAllFiles] = useState([]);

  const backendUrl = "http://localhost:5000";

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${backendUrl}/files`);
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setAllFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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
      setMessage(data.message);
      setDownloadLink(data.downloadUrl);
      setSizeInfo({
        original: data.originalSize,
        compressed: data.compressedSize,
        reduction: data.reductionPercent,
      });

      fetchFiles();
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#333" }}>📂 Slimify</h1>
      <p style={{ color: "#666" }}>Upload your image or PDF and get a compressed version instantly.</p>

      <input type="file" name="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          marginLeft: "10px",
          padding: "8px 16px",
          border: "none",
          borderRadius: "5px",
          background: loading ? "#aaa" : "#007bff",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "⏳ Uploading..." : "Upload & Compress"}
      </button>

      <p style={{ marginTop: "10px", fontWeight: "bold", color: message.includes("❌") ? "red" : "green" }}>
        {message}
      </p>

      {sizeInfo && (
        <div style={{ marginTop: "20px" }}>
          <p>📏 Original Size: {formatSize(sizeInfo.original)}</p>
          <p>📉 Compressed Size: {formatSize(sizeInfo.compressed)}</p>
          <p>💡 Reduction: {sizeInfo.reduction.toFixed(2)}%</p>
        </div>
      )}

      {downloadLink && (
        <a
          href={downloadLink}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            marginTop: "15px",
            padding: "8px 12px",
            background: "green",
            color: "white",
            borderRadius: "5px",
            textDecoration: "none",
          }}
        >
          ⬇️ Download Compressed File
        </a>
      )}

      {allFiles.length > 0 && (
        <div style={{ marginTop: "40px", display: "inline-block", textAlign: "left" }}>
          <h3>📄 Previously Uploaded Files</h3>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", minWidth: "600px" }}>
            <thead style={{ background: "#f2f2f2" }}>
              <tr>
                <th>Original Name</th>
                <th>Compressed Name</th>
                <th>Original Size</th>
                <th>Compressed Size</th>
                <th>Reduction %</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {allFiles.map((f) => (
                <tr key={f._id}>
                  <td>{f.originalName}</td>
                  <td>{f.compressedName}</td>
                  <td>{formatSize(f.originalSize)}</td>
                  <td>{formatSize(f.compressedSize)}</td>
                  <td>{f.reductionPercent.toFixed(2)}%</td>
                  <td>
                    <a href={`${backendUrl}/uploads/${f.compressedName}`} target="_blank" rel="noreferrer">
                      ⬇️
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
