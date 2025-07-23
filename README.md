# LeetCode Tracker Zen

A full-stack web app to track your LeetCode problems and solutions, built with React (Vite) frontend and Node.js/Express backend.

---

## Features
- Add, edit, and delete LeetCode problems
- Add solutions to problems (with code, language, explanation, etc.)
- Progress tracking and filtering
- Import/export (local, backend import/export coming soon)
- Deployed frontend (Vercel) and backend (Render)

---

## Local Development

### 1. Clone the Repository
```sh
git clone https://github.com/YOUR-USERNAME/leetcode-tracker-zen.git
cd leetcode-tracker-zen
```

### 2. Start the Backend
```sh
cd backend
npm install
npm start
```
- The backend runs on [http://localhost:4000](http://localhost:4000)

### 3. Start the Frontend
```sh
cd ..
npm install
npm run dev
```
- The frontend runs on [http://localhost:5173](http://localhost:5173)

---

## Deployment

### Backend (Render)
- Push your code to GitHub.
- Create a new **Web Service** on [Render](https://dashboard.render.com/):
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
- Set environment variables as needed in Render dashboard.

### Frontend (Vercel)
- Import your repo on [Vercel](https://vercel.com/).
- Framework: Vite
- Output Directory: `dist`
- Set `VITE_API_URL` in Vercel project settings to your Render backend URL (e.g., `https://your-backend.onrender.com`)

---

## Environment Variables

### Frontend (Vite)
- `.env` (for local dev):
  ```
  VITE_API_URL=http://localhost:4000
  ```
- On Vercel: Add `VITE_API_URL` in project settings.

### Backend (Express)
- Add any secrets or API keys in Render's Environment tab.

---

## Troubleshooting
- **Failed to load problems:**
  - Check API URL in `src/services/problemApiService.ts` and Vercel env vars.
  - Make sure backend is running and accessible.
  - Check CORS: backend should have `app.use(cors())`.
- **Failed to add solution:**
  - Ensure backend has `/api/problems/:id/solutions` endpoint.
  - Frontend should use `ProblemApiService.addSolution`.
- **Import/export not working:**
  - Currently works locally; backend-powered import/export coming soon.
- **Deployment issues:**
  - Check Render/Vercel logs for errors.

---

## Contributing
Pull requests welcome! For major changes, open an issue first to discuss what you’d like to change.

---

## License
[MIT](LICENSE)

