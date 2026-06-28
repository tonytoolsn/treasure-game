# Deploy to Vercel via GitHub

Push the latest code to GitHub, then deploy to Vercel production. After deployment, open the live URL for the user.

## Overview
- Code lives in a GitHub repo → Vercel pulls from GitHub → builds `frontend/` → serves the SPA.
- The backend (Express + SQLite) is NOT deployed. Guests can play; login/score won't work in production.

---

## Step 1 — Commit any uncommitted changes

Check for uncommitted changes:
```bash
git status
```

If there are modified files, stage and commit them:
```bash
git add frontend/src/App.tsx   # (or specific files that changed)
git commit -m "chore: sync local changes before deploy"
```

---

## Step 2 — Ensure a GitHub remote exists

Check if a remote is already configured:
```bash
git remote -v
```

**If no remote exists**, create a GitHub repo and push:
```bash
gh repo create <repo-name> --public --source=. --remote=origin --push
```
Replace `<repo-name>` with something like `treasure-game`. If the user already has a remote, skip to Step 3.

**If a remote exists but the branch hasn't been pushed**, push it:
```bash
git push -u origin master
```

---

## Step 3 — Push latest commits to GitHub

```bash
git push origin master
```

Confirm the push succeeded before deploying.

---

## Step 4 — Deploy to Vercel (pulls from GitHub)

Check Vercel CLI:
```bash
vercel --version
```
If not installed: `npm install -g vercel`

Check login:
```bash
vercel whoami
```
If not logged in, tell the user to run `! vercel login` in the prompt.

Deploy from the `frontend/` subfolder (Vercel uses the code from your local working tree but syncs it to the project linked to your GitHub repo):
```bash
vercel --cwd frontend --prod --yes
```

---

## Step 5 — Report the URL and open it

The production URL appears after `▲ Aliased` in the output.

- Tell the user the URL.
- Open it in their browser:
```bash
start <url>        # Windows
# or
open <url>         # macOS
```

---

## Notes
- `frontend/vercel.json` must exist with:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
- `outputDirectory` must be `build` (not `dist`) — Vite is configured to output there.
- Do NOT place `vercel.json` at the project root — Vercel rejects monorepo-style top-level config.
- Do NOT use `--cwd` at the project root; always target `frontend/`.
