# Deploy to GitHub Pages

Deploy the treasure game frontend to GitHub Pages. No backend needed — it's a static SPA.

The live URL will be: `https://<github-username>.github.io/<repo-name>/`

---

## Step 1 — Check / install GitHub CLI

```bash
gh --version
```

If not installed:
```powershell
winget install --id GitHub.cli -e
```

Then check login:
```bash
gh auth status
```

If not logged in, tell the user to run `! gh auth login` in the prompt.

---

## Step 2 — Commit any local changes

```bash
git status
git add -A
git commit -m "chore: prepare for GitHub Pages deployment"
```

---

## Step 3 — Create GitHub repo and push (if no remote exists)

Check first:
```bash
git remote -v
```

If no remote, create repo and push:
```bash
gh repo create treasure-game --public --source=. --remote=origin --push
```

If remote already exists, just push:
```bash
git push origin master
```

---

## Step 4 — Set Vite base URL for GitHub Pages

GitHub Pages serves the site at `/<repo-name>/`, so Vite must know this base path.

Edit `frontend/vite.config.ts` — add `base: '/treasure-game/'` inside `defineConfig`:

```ts
export default defineConfig({
  base: '/treasure-game/',
  plugins: [react()],
  // ...rest unchanged
})
```

**Important:** Replace `treasure-game` with the actual repo name if different.

---

## Step 5 — Install gh-pages package and add deploy script

```bash
cd frontend
npm install --save-dev gh-pages
```

Add these two scripts to `frontend/package.json` (inside `"scripts"`):
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

---

## Step 6 — Deploy to GitHub Pages

```bash
cd frontend && npm run deploy
```

This builds the app and pushes `build/` to the `gh-pages` branch automatically.

---

## Step 7 — Enable GitHub Pages in repo settings

Run:
```bash
gh api repos/{owner}/{repo}/pages --method POST -f source[branch]=gh-pages -f source[path]=/
```

Or tell the user to go to: `https://github.com/<username>/<repo>/settings/pages`
and set Source → Deploy from branch → `gh-pages` / `/ (root)`.

---

## Step 8 — Report the URL and open it

GitHub Pages takes ~30–60 seconds to go live after first deploy.

The URL is: `https://<github-username>.github.io/<repo-name>/`

Open it:
```bash
start https://<github-username>.github.io/<repo-name>/
```

---

## Notes
- After setup, future deploys only need `cd frontend && npm run deploy`
- The `base` in vite.config.ts **must match** the repo name exactly (case-sensitive)
- If you rename the repo, update `base` in vite.config.ts accordingly
- Do NOT change `outputDirectory` — it's `build/` in this project
