# MediCare AI - Fullstack Healthcare Product Repository

MediCare AI is a production-quality healthcare web application designed to help patients understand complex medical prescriptions, simplify healthcare terminology, schedule medicine reminders, translate health documents into regional languages, and access AI-powered health assistance.

---

## 📁 Repository Structure

```
C:\Users\krkts\OneDrive\Desktop\Internship\
├── frontend/                  # React (Vite) Frontend Application
│   ├── src/
│   │   ├── components/        # UI & Layout components (PublicNavbar, AppSidebar, AppHeader, UserAvatar)
│   │   ├── context/           # AuthContext, ThemeContext, ToastContext
│   │   ├── i18n/              # Regional language localization dictionary
│   │   ├── pages/             # 20+ healthcare experience pages
│   │   ├── services/          # api.js, authService.js, documentService.js, scheduleStore.js
│   │   └── styles/            # CSS Design System (variables, global, components, pages, responsive)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── backend/                   # Django REST Framework Backend API
    ├── healthcare_backend/    # Django Settings & URL Routing
    ├── patients/              # Patients App (User Registration, Auth Tokens, Vision OCR Service)
    ├── media/                 # Uploaded prescription images storage
    ├── manage.py
    └── requirements.txt
```

---

## ⚡ How to Run the Application

### 1. Run Django Backend Server

```bash
cd C:\Users\krkts\OneDrive\Desktop\Internship\backend
python manage.py runserver 8000
```
- **Backend API**: `http://127.0.0.1:8000/`

### 2. Run React Frontend Application

```bash
cd C:\Users\krkts\OneDrive\Desktop\Internship\frontend
npm install
npm run dev
```
- **Frontend App**: `http://localhost:3000/`

---

## 🚀 Backend API Endpoints

- `POST /api/register/`: Patient registration (`username`, `password`, `full_name`, `age`, `gender`, `phone_number`, `preferred_language`)
- `POST /api/token/`: Obtain JWT Access & Refresh Tokens (`username`, `password`)
- `GET /api/profile/`: Retrieve authenticated patient profile details
- `POST /api/documents/`: Upload prescription image for Gemini Vision OCR extraction (`ai_summary`)
- `GET /api/documents/`: List all uploaded prescription documents for history vault

---

## 🌟 Key Application Features

1. **Healthcare Design System**: Clean mint/green identity (`#16A57A`, `#087F62`, `#EAF8F2`) with high-contrast dark theme support.
2. **Prescription OCR & History Vault**: Upload doctor prescriptions, extract medicines (`Medicine | Instruction | Quantity`) via Google Gemini Vision, view scanned pictures, and re-create schedules.
3. **Interactive Patient Dashboard**: Real-time adherence stats, chronological schedule timeline, next reminder promotion, and dose reset options.
4. **AI Communication Suite**: AI Health Assistant (with TTS speech audio), Medical Term Simplifier, 8-Language Regional Translator, Voice Assistant, Symptom Guide, Emergency assistance, and Health Education Hub.
