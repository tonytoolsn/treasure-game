# Deploy to Vercel

Deploy this treasure game project to Vercel. The project has a React/Vite frontend and a Node.js/Express + SQLite backend.

## Steps

### 1. Check Vercel CLI
Run `vercel --version` to check if Vercel CLI is installed. If not installed, run `npm install -g vercel` first.

### 2. Check login status
Run `vercel whoami` to check if the user is logged in. If not, tell the user to run `! vercel login` in the prompt (interactive login is needed).

### 3. Assess deployment strategy
This project has two parts:
- **Frontend** (`frontend/`) — React + Vite SPA, can deploy to Vercel as static site
- **Backend** (`backend/`) — Express + SQLite, SQLite is file-based and incompatible with Vercel's ephemeral serverless environment

**SQLite limitation**: Vercel's filesystem is read-only at runtime (except `/tmp`, which is wiped between requests). This means the SQLite database (`game.db`) will not persist between function invocations.

**Deployment plan**: Deploy frontend only. Auth/score features will be unavailable in production (guests can still play the game). Inform the user of this limitation and ask if they want to proceed, or if they'd prefer to switch to a persistent DB (e.g., Turso, PlanetScale, Supabase) first.

### 4. Create vercel.json at project root
If user wants to proceed with frontend-only deploy, write a `vercel.json` at the project root:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/build",
  "framework": null,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
This configures Vercel to build from the `frontend/` subfolder and serve the Vite output.

### 5. Deploy
Run `vercel --prod` from the project root. If this is the first deployment:
- Accept the default project name or suggest `treasure-game-[username]`
- Set the root directory to `.` (current)
- Do NOT override the build/output settings (vercel.json handles them)

### 6. Report the URL
After deployment succeeds, extract the production URL from the output and tell the user the URL. Open it if possible.

### 7. Cleanup note
Remind the user that the login/score features won't work in this deployment since the backend is not deployed. To fully deploy the backend, they would need to:
- Replace SQLite with a cloud database (Turso, PlanetScale, or Supabase)
- Rewrite `backend/` routes as Vercel API functions under `api/` at the project root
