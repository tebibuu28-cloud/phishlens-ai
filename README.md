<div align="center">
  <img src="https://img.icons8.com/?size=100&id=113038&format=png&color=4ade80" alt="PhishLens AI Logo" width="80" />
  
  # PhishLens AI
  
  **Know if an email is a phishing attempt in seconds.**
  
  *A privacy-first, client-side email analysis tool built for the OpenAI Build Week.*

  [![Live Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge)](https://your-vercel-link-here.vercel.app)
</div>

---

## 🛡️ The Problem

Phishing attacks are becoming increasingly sophisticated. While email providers do their best to filter spam, dangerous emails still slip through to your inbox every day. Users are often told "don't click suspicious links," but without technical knowledge, it's incredibly difficult to know *what* makes a link suspicious or how to inspect hidden domains.

## 🚀 The Solution

**PhishLens AI** is a professional, educational cybersecurity dashboard that acts as your personal security analyst. 

Instead of guessing, you can paste the raw text of an email (or upload an `.eml` file) directly into the PhishLens Analyzer. The application will instantly parse the data, run a heuristic analysis, and provide a clear, color-coded **Risk Score**. 

Crucially, it explains *why* the email was flagged and extracts all hidden links into a safe viewing environment so you can inspect them without accidentally clicking on malware.

### 🔒 Privacy First

PhishLens AI is built with a zero-trust, privacy-first architecture. All parsing and detection logic runs **entirely in your browser's memory**. Your sensitive emails are never uploaded to a backend server or stored in a database. The moment you close the tab, the data ceases to exist.

---

## ✨ Features

- **Instant Threat Analysis**: Paste email text or upload `.eml` files.
- **Client-Side Parsing Engine**: Automatically extracts Senders, Subjects, Dates, and hidden URLs securely in the browser.
- **Heuristic Detection**: Scans for urgency triggers, financial scams, credential theft requests, and formatting anomalies.
- **Artifact Extraction**: Safely extracts and displays malicious links and domains so you can investigate without clicking.
- **Educational Explanations**: Generates clear, human-readable reasons for why an email is dangerous and provides recommended actions.
- **Premium UI**: Designed with a stunning dark-mode glassmorphic aesthetic using Tailwind CSS and shadcn/ui.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Component Library**: shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Form Management**: React Hook Form
- **Validation**: Zod
- **Deployment**: Vercel

---

## 💻 Running Locally

If you would like to run PhishLens AI on your own machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/phishlens-ai.git
   cd phishlens-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

---

## 🔮 Future Roadmap (Version 2)

While this MVP provides a robust heuristic engine, future versions will include:
- **True AI Integration**: Connecting to the OpenAI API for deep semantic analysis of the email body to detect highly sophisticated spear-phishing.
- **Threat Intelligence APIs**: Integrating with VirusTotal to check extracted URLs against global malware databases in real-time.
- **Browser Extension**: Analyzing emails directly inside Gmail or Outlook without needing to copy/paste.

---

*Built with ❤️ for the OpenAI Build Week.*
