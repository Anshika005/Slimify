Perfect 👍 I’ll **integrate the screenshots section directly into your current README** without altering anything else. Here’s the updated version with screenshots added in the right place:

---

# 📦 Slimify – Image & PDF Compressor

Slimify is a **full-stack web application** that allows users to **upload, compress, and download** images and PDF files instantly.
Built with the **MERN stack**, it ensures fast processing, efficient storage, and a clean user experience.

🚀 **Live Demo:** [Slimify](https://slimify-ten.vercel.app/)
⚡ **Backend API:** [Railway Deployment](https://amusing-purpose-production.up.railway.app/)

---

## ✨ Features

* 📤 Upload **images (JPG/PNG)** or **PDF files**
* 🔄 Automatic compression with **Ghostscript (PDF)** & **Sharp (Images)**
* 📊 Shows **original size, compressed size, and % reduction**
* 💾 Download compressed files instantly
* 📜 History of previously uploaded files
* ☁️ **Deployed on Vercel (Frontend)** + **Railway (Backend)**

---

## 🏗️ Tech Stack

**Frontend** → React.js, Tailwind CSS
**Backend** → Node.js, Express.js
**Database** → MongoDB (GridFS for file storage)
**Compression** → Ghostscript (PDF), Sharp (Images)
**Deployment** → Vercel (Frontend), Railway + Docker (Backend)

---

## 📂 Project Structure

```
Slimify/
│── backend/                # Backend (Node.js + Express)
│   │── uploads/            # Temp file storage
│   │── server.js           # Main backend entry
│   │── package.json        # Backend dependencies
│   │── Dockerfile          # Backend container setup
│   │── railway.toml        # Railway deployment config
│
│── frontend/               # Frontend (React + Tailwind)
│   │── public/             # Static files
│   │── src/                # React source code
│   │   │── App.js          # Root component
│   │   │── App.css         # Styles
│   │   │── index.js        # React DOM entry
│
│── README.md               # Project documentation
│── .gitignore              # Ignored files
```

---

## ⚙️ How It Works

1. **Upload** → User selects an image or PDF
2. **Compression** →

   * PDF → Compressed using Ghostscript
   * Image → Compressed using Sharp
3. **Storage** → File temporarily saved / stored in MongoDB (GridFS)
4. **Response** → Backend sends compressed file + stats (size reduction)
5. **Download** → User downloads the optimized file

---

## 📸 Screenshots & Demo

### 🖼️ 1. Before Uploading

<img width="1919" height="961" alt="image" src="https://github.com/user-attachments/assets/4327c47c-d7c4-420b-b4b6-c17bcaa40302" />


---

### ⬆️ 2. During Uploading

<img width="1919" height="964" alt="image" src="https://github.com/user-attachments/assets/4531dd4e-b5cc-4ef3-bb16-20b2561b36b5" />


---

### 📄 3. PDF Compression Result

<img width="1919" height="959" alt="image" src="https://github.com/user-attachments/assets/c2668843-93fd-4306-8c12-955abe1614ca" />


---

### 🖼️ 4. Image Compression Result

<img width="1919" height="961" alt="image" src="https://github.com/user-attachments/assets/2f94107a-79da-470c-bbe9-1bef2047048a" />


---

## 🖥️ Setup & Installation

Clone the repository:

```bash
git clone https://github.com/Anshika005/Slimify.git
cd Slimify
```

### 🔹 Backend

```bash
cd backend
npm install
npm start   # Runs on http://localhost:5000
```

### 🔹 Frontend

```bash
cd frontend
npm install
npm start   # Runs on http://localhost:3000
```

---

## 📊 Example Compression

| File       | Original Size | Compressed Size | Reduction |
| ---------- | ------------- | --------------- | --------- |
| Resume.pdf | 280 KB        | 130 KB          | 🔻 53.68% |
| Banner.png | 335 KB        | 19 KB           | 🔻 94.20% |
| Photo.jpg  | 3.06 KB       | 580 B           | 🔻 81.48% |

---

## 🚀 Deployment

* **Frontend** → Vercel (`frontend/`)
* **Backend** → Railway (`backend/` with Dockerfile + railway.toml)

---

## 🌟 Future Improvements

* 🔐 User authentication with history tracking
* 📂 Bulk compression (multiple files at once)
* ☁️ Cloud storage integration (AWS S3 / GCP)
* 📱 Mobile-friendly PWA version
* 📊 Compression analytics dashboard (files optimized, storage saved, etc.)
* 🌍 Multi-language support for global accessibility

---

## 👩‍💻 Author

**Anshika Mishra**

---

✨ *Slimify makes your files lighter, faster, and easier to share!*

---
