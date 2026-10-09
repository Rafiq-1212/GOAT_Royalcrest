# Goat Assets Dubai

A modern, luxury real estate investment platform organized as a multi-app workspace with a lead-generation funnel and an administrative portal.

---

## 📁 Project Structure

```
GoatAssetsDubai/
├── apps/
│   ├── funnel-app/       # Public landing page & multi-step questionnaire funnel (Port 3000)
│   └── admin-app/        # Protected admin portal with bcrypt auth & lead management (Port 3001)
├── prisma/               # Shared PostgreSQL database schema & migrations (Neon DB)
├── package.json          # Workspace manager scripts
└── .env.example          # Environment variables template
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Applications

- **Run Funnel Landing Page (Port 3000)**:
  ```bash
  npm run dev:funnel
  # or
  npm run dev
  ```
  Accessible at: [http://localhost:3000](http://localhost:3000)

- **Run Admin Portal (Port 3001)**:
  ```bash
  npm run dev:admin
  ```
  Accessible at: [http://localhost:3001](http://localhost:3001) or [http://localhost:3000/admin](http://localhost:3000/admin) (proxied).

---

## 🔐 Admin Portal Credentials

- **Username / Email**: `adminassets@gmail.com`
- **Password**: `goatassetsdubai`
- **Security**: Passwords verified via bcrypt (`bcryptjs`), sessions managed via secure HTTP-only cookies.

---

## 🛠️ Build Commands

- Build both applications: `npm run build`
- Build Funnel app only: `npm run build:funnel`
- Build Admin app only: `npm run build:admin`
