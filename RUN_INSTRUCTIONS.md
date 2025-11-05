# How to Run Taskify

You need to run both the **Backend** (Flask) and **Frontend** (React) servers. Use **two separate terminal windows**.

---

## 🚀 Quick Start

### Terminal 1: Backend (Flask)

1. Open PowerShell or Command Prompt
2. Navigate to the backend folder:
   ```powershell
   cd backend
   ```

3. Check if virtual environment exists:
   ```powershell
   # If venv folder exists, activate it:
   .\venv\Scripts\Activate.ps1
   ```
   
   If you get an execution policy error, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   Then try activating again.

4. If venv doesn't exist, create it:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

5. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

6. Run the backend server:
   ```powershell
   python app.py
   ```

   You should see:
   ```
   * Running on http://127.0.0.1:5000
   ```

✅ **Backend is now running on http://127.0.0.1:5000**

---

### Terminal 2: Frontend (React/Vite)

1. Open a **new** PowerShell or Command Prompt window
2. Navigate to the frontend folder:
   ```powershell
   cd frontend
   ```

3. Install dependencies (first time only):
   ```powershell
   npm install
   ```

4. Run the frontend development server:
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ```

✅ **Frontend is now running on http://localhost:5173**

---

## 🌐 Access the Application

1. Open your browser
2. Go to: **http://localhost:5173**
3. Register a new account or login
4. Start adding tasks!

---

## 🔧 Troubleshooting

### Backend Issues:

**Port 5000 already in use:**
- Close the process using port 5000, or
- Change the port in `backend/app.py` (line 105): `app.run(debug=True, port=5001)`

**Python not found:**
- Make sure Python is installed: `python --version`
- Try `python3` instead of `python`

**Module not found errors:**
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues:

**Port 5173 already in use:**
- Vite will automatically use the next available port

**npm not found:**
- Install Node.js from https://nodejs.org/

**Dependencies not installing:**
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

**CORS errors:**
- Make sure backend is running
- Check that backend URL matches: `http://127.0.0.1:5000`

---

## 📝 Notes

- Keep both terminals open while using the app
- Backend must be running before frontend can make API calls
- The backend creates a SQLite database (`taskify.db`) automatically
- Frontend uses Vite for fast hot-reloading during development

---

## 🛑 To Stop the Servers

- Press `Ctrl+C` in each terminal window to stop the servers

