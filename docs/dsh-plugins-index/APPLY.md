# Apply to risaddex/dsh-plugins-index

This folder is a ready drop-in for https://github.com/risaddex/dsh-plugins-index
(the market index at `https://raw.githubusercontent.com/risaddex/dsh-plugins-index/main/index.json`).

## One-shot apply

```bash
git clone https://github.com/risaddex/dsh-plugins-index.git
cd dsh-plugins-index
cp -R /path/to/dsh-prompt/docs/dsh-plugins-index/.github .
cp /path/to/dsh-prompt/docs/dsh-plugins-index/scripts/sync-releases.mjs scripts/
cp /path/to/dsh-prompt/docs/dsh-plugins-index/index.json .
cp /path/to/dsh-prompt/docs/dsh-plugins-index/README.md .
git add -A
git commit -m "feat: sync GitHub Releases into index.json (+ dsh-prompt 0.5.1)"
git push origin main
```

Then in the index repo: **Actions → sync-releases → Run workflow** (optional; cron also runs daily at 06:17 UTC).

For private plugin repos, add secret `INDEX_SYNC_TOKEN` (PAT with `contents:read` on those repos). Public repos like `dsh-prompt` work with the default `GITHUB_TOKEN`.

## What it does

- Prepends newer GitHub Release versions into each plugin's `versions[]` (SemVer).
- Standalone repos: tags `vX.Y.Z` / `X.Y.Z`.
- Monorepo packages (`repository.directory` set): tags `name@X.Y.Z` or `name-vX.Y.Z`.
- Regenerates the README table.
- Commits and pushes to `main` when something changed.

`dsh-prompt@0.5.1` is already listed so Discover can install / auto-update the EN/PT fork.
