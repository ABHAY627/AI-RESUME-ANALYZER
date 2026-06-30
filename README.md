<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=6366f1&height=200&section=header&text=ResumeXpert&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=AI-Powered%20Resume%20Analyzer&descAlignY=55&descAlign=50&descColor=c7d2fe" width="100%"/>

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&multiline=true&width=600&height=80&lines=Upload+your+resume.;Get+AI-powered+feedback.;Land+your+dream+job.)](https://git.io/typing-svg)

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-v7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Neon-Postgres-00E5CC?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

<br/>

</div>

---

## ✨ What is ResumeXpert?

**ResumeXpert** is a full-stack AI resume analyzer. Upload your PDF resume, paste a job description, and get instant, structured feedback powered by Google Gemini — covering ATS compatibility, tone & style, content quality, structure, and skills alignment.

<div align="center">

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Upload PDF  →  Gemini AI Analysis  →  Structured Score   │
│                                                             │
│   ATS Score · Tone & Style · Content · Structure · Skills  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

</div>

---

## 🚀 Features

<table>
<tr>
<td width="50%">

### 🔐 Auth
- Custom JWT authentication (no third-party SDK)
- Email + password sign up / sign in
- httpOnly cookies — 7 day sessions
- Server-side protected routes

</td>
<td width="50%">

### 🤖 AI Analysis
- Google Gemini (`gemini-2.0-flash`)
- Reads your PDF as base64 inline data
- Returns structured JSON feedback
- Scored across 5 categories

</td>
</tr>
<tr>
<td width="50%">

### 📁 Storage
- PDFs stored on Vercel Blob
- Served via secure server-side proxy
- No iframe CORS issues
- Private per-user access control

</td>
<td width="50%">

### 🗄️ Database
- Neon Postgres (serverless)
- Prisma v7 with Neon adapter
- Idempotent uploads (no duplicates)
- Full resume history per user

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:---|:---|
| **Framework** | React Router v7 (SSR) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Auth** | Custom JWT + bcrypt |
| **Database** | Neon Postgres |
| **ORM** | Prisma v7 + Neon Adapter |
| **AI** | Google Gemini 2.0 Flash |
| **File Storage** | Vercel Blob |
| **Validation** | Zod |
| **Deployment** | Vercel |

</div>

---

## 📁 Project Structure

```
📦 ai-resume-analyzer
├── 📂 app
│   ├── 📂 components          # UI components
│   │   ├── Navbar.tsx         # Navigation with auth state
│   │   ├── ResumeCard.tsx     # Resume preview card
│   │   ├── ScoreCircle.tsx    # Circular score indicator
│   │   ├── ScoreGauge.tsx     # Gauge chart for overall score
│   │   ├── Summary.tsx        # Score summary panel
│   │   ├── ATS.tsx            # ATS analysis section
│   │   ├── Details.tsx        # Detailed accordion feedback
│   │   └── FileUploader.tsx   # Drag & drop PDF uploader
│   ├── 📂 lib
│   │   ├── auth.server.ts     # JWT, bcrypt, cookie helpers
│   │   ├── db.server.ts       # Prisma + Neon client singleton
│   │   ├── env.server.ts      # Typed env accessors (lazy)
│   │   ├── session.server.ts  # requireUser / optionalUser
│   │   └── storage.server.ts  # Vercel Blob upload/delete
│   ├── 📂 routes
│   │   ├── home.tsx           # Dashboard — all resumes
│   │   ├── auth.tsx           # Sign in / Sign up
│   │   ├── logout.tsx         # Clear cookie + redirect
│   │   ├── upload.tsx         # Upload form + Gemini analysis
│   │   ├── resume.tsx         # Resume detail + feedback
│   │   ├── resume-pdf.tsx     # PDF proxy (stream from Blob)
│   │   └── wipe.tsx           # Delete all user resumes
│   ├── root.tsx               # App shell
│   └── app.css                # Global styles
├── 📂 prisma
│   └── schema.prisma          # DB schema (User + Resume)
├── 📂 resumeData
│   └── index.ts               # Demo resumes + Gemini prompt
├── .env.example               # Environment variable template
└── vercel.json                # Vercel deployment config
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js 20+
- [Neon](https://neon.tech) Postgres database (free tier works)
- [Google AI Studio](https://aistudio.google.com/apikey) Gemini API key
- [Vercel](https://vercel.com) account + Blob store

### 1. Clone and install

```bash
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
# Neon Postgres — from neon.tech dashboard
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# JWT secret — any random 32+ character string
# Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your-super-secret-key-minimum-32-characters"

# Gemini API key — from aistudio.google.com/apikey (starts with AIza...)
GEMINI_API_KEY="AIzaSy..."

# Vercel Blob — from Vercel Dashboard → Storage → Blob → Token
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### 3. Set up the database

```bash
npm run db:push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🚢 Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "feat: initial commit"
git push origin main
```

### 2. Import on Vercel

- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Framework auto-detected as **React Router**

### 3. Connect Vercel Blob Storage

```
Vercel Dashboard → Storage → your Blob store → Projects → connect this project
```
This auto-injects `BLOB_READ_WRITE_TOKEN` into your deployment.

### 4. Add environment variables

In **Vercel → Project → Settings → Environment Variables**:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Your secret key |
| `GEMINI_API_KEY` | Your Gemini API key |

> `BLOB_READ_WRITE_TOKEN` is auto-added by the Blob store connection above.

### 5. Deploy 🚀

Every push to `main` triggers a new deployment automatically.

---

## 🔄 How It Works

```
User uploads PDF + job description
           │
           ▼
    Server validates input
           │
           ▼
    PDF → Vercel Blob (stored, returns public URL)
           │
           ▼
    Resume record saved to Neon DB (feedback: null)
           │
           ▼
    PDF sent to Gemini as base64 inline data
           │
           ▼
    Gemini returns structured JSON feedback
           │
           ▼
    DB record updated with feedback JSON
           │
           ▼
    User redirected to /resume/:id
           │
      ┌────┴────┐
      ▼         ▼
  PDF shown   AI feedback
  (via proxy) (scores + tips)
```

**Idempotency:** Uploading the same company + job title twice returns the cached result instantly — no duplicate Gemini calls, no duplicate DB records.

---

## 📊 Feedback Categories

Each resume is scored across **5 categories**, each out of 100:

| Category | What it measures |
|:---|:---|
| 🎯 **ATS Score** | Keyword matching, formatting compatibility with applicant tracking systems |
| 🗣️ **Tone & Style** | Professional language, consistency, readability |
| 📝 **Content** | Achievements, impact statements, relevance to job description |
| 🏗️ **Structure** | Layout, sections, visual hierarchy |
| 🛠️ **Skills** | Technical and soft skill alignment with the role |

---

## 🧑‍💻 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Serve production build
npm run typecheck    # TypeScript type checking
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:generate  # Regenerate Prisma client
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|:---|:---:|:---|
| `DATABASE_URL` | ✅ | Neon Postgres connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens (min 32 chars) |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key (starts with `AIza`) |
| `BLOB_READ_WRITE_TOKEN` | ✅ | Vercel Blob storage token |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a pull request

---

## 📄 License

MIT © [Abhay Gautam](https://github.com/your-username)

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=6366f1&height=120&section=footer&animation=fadeIn" width="100%"/>

<p>
  <img src="https://img.shields.io/badge/Built%20with-❤️-red?style=flat-square" />
  <img src="https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel" />
</p>

⭐ **Star this repo if it helped you land your dream job!**

</div>
