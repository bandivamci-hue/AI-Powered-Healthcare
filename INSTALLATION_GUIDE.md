# MediCare AI - Setup & Installation Guide

This guide explains how to install and run the **MediCare AI** healthcare application on any computer.

---

## 🛠️ Prerequisites (What needs to be installed first)

Before running the project, make sure the following software is installed on the machine:

1. **Node.js** (v18.0 or higher)
   - Downloads `npm` package manager automatically.
   - Download: [https://nodejs.org/](https://nodejs.org/)

2. **Python** (v3.10, v3.11, or v3.12)
   - Make sure to check **"Add Python to PATH"** during installation.
   - Download: [https://www.python.org/downloads/](https://www.python.org/downloads/)

3. **Git** *(Optional)*
   - Download: [https://git-scm.com/](https://git-scm.com/)

---

## 🚀 How to Run the Project (Step-by-Step)

### Step 1: Set Up & Start the Backend (Django REST API)

1. Open your terminal/command prompt and navigate into the `backend` folder:
   ```bash
   cd backend
   ```

2. Create a Virtual Environment (Recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the Virtual Environment:
   - **Windows (PowerShell/CMD)**:
     ```powershell
     venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```

4. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

5. Run database setup & migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the Django Backend Server:
   ```bash
   python manage.py runserver 8000
   ```
   - The backend API will start running at **`http://127.0.0.1:8000/`**.

---

### Step 2: Set Up & Start the Frontend (React + Vite)

1. Open a **new** terminal window and navigate into the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install Node.js package dependencies:
   ```bash
   npm install
   ```

3. Start the Frontend Development Server:
   ```bash
   npm run dev
   ```
   - The frontend web application will start running at **`http://localhost:3000/`**.

---

## 📦 Installed Python Dependencies (`backend/requirements.txt`)

- `django` (Web Framework)
- `djangorestframework` (REST API Toolkit)
- `djangorestframework-simplejwt` (JWT Token Authentication)
- `django-cors-headers` (CORS Support for React Frontend)
- `google-genai` (Gemini Vision AI Engine for Prescription OCR)
- `pillow` (Image Processing)

---

## 📦 Installed Frontend Dependencies (`frontend/package.json`)

- `react` & `react-dom` (v18)
- `react-router-dom` (Routing & Navigation)
- `axios` (API Request Client)
- `lucide-react` (Healthcare Icons)
- `vite` & `@vitejs/plugin-react` (Development Server & Bundler)

---

## 🔑 Optional: Gemini API Key for Prescription OCR

If you wish to test live prescription image scanning with Google Gemini AI:
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Open `backend/healthcare_backend/settings.py` and set your key:
   ```python
   GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
   ```
