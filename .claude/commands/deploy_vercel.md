# Deploy to Vercel

Deploy the treasure game frontend to Vercel. The backend (Express + SQLite) is NOT deployed — SQLite doesn't persist on Vercel's serverless environment. Guests can still play the game; login/score features won't work in production.

## Important notes (learned from experience)
- **Do NOT place `vercel.json` at the project root** — Vercel auto-detects `frontend/` and `backend/` as separate monorepo services and rejects top-level `buildCommand`/`outputDirectory` properties.
- **Do NOT use `rootDirectory`** in vercel.json — it's not a valid property.
- **Always deploy using `--cwd frontend`** to target the frontend subfolder directly.
- `frontend/vercel.json` already exists in the repo with the correct config.

## Steps

### 1. Check Vercel CLI
Run `vercel --version`. If not installed, run `npm install -g vercel`.

### 2. Check login status
Run `vercel whoami`. If not logged in, tell the user to run `! vercel login` in the prompt (interactive login — cannot be run headlessly).

### 3. Deploy
```bash
vercel --cwd frontend --prod --yes
```

### 4. Report the URL
The production URL is shown in the output after `▲ Aliased`. Tell the user the URL.

---

## If `frontend/vercel.json` is ever missing, recreate it as:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
`outputDirectory` must be `build` (not `dist`) — this project's Vite config outputs to `build/`.
