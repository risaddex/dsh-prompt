#!/usr/bin/env node
/**
 * Sync index.json plugin versions from GitHub Releases.
 *
 * For each plugin whose repository.url is a github.com repo:
 *   - list public (or token-visible) releases
 *   - pick tags that belong to that plugin (standalone: vX.Y.Z; monorepo path: name@X.Y.Z)
 *   - prepend any SemVer newer than the newest version already indexed
 *
 * Usage:
 *   node scripts/sync-releases.mjs
 *   DRY_RUN=1 node scripts/sync-releases.mjs
 *
 * Auth: GITHUB_TOKEN / GH_TOKEN (optional for public repos; required for private).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const INDEX_PATH = path.join(ROOT, 'index.json')
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
const API = 'https://api.github.com'

function die(msg) {
  console.error(msg)
  process.exit(1)
}

function parseSemver(raw) {
  const s = String(raw || '').trim().replace(/^v/i, '')
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(s)
  if (!m) return null
  return {
    raw: s,
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] || null,
  }
}

function cmpSemver(a, b) {
  const pa = parseSemver(a)
  const pb = parseSemver(b)
  if (!pa || !pb) return 0
  if (pa.major !== pb.major) return pa.major < pb.major ? -1 : 1
  if (pa.minor !== pb.minor) return pa.minor < pb.minor ? -1 : 1
  if (pa.patch !== pb.patch) return pa.patch < pb.patch ? -1 : 1
  if (pa.prerelease === pb.prerelease) return 0
  if (pa.prerelease == null) return 1
  if (pb.prerelease == null) return -1
  return pa.prerelease < pb.prerelease ? -1 : pa.prerelease > pb.prerelease ? 1 : 0
}

function githubRepo(url) {
  try {
    const u = new URL(String(url || ''))
    if (!/^(www\.)?github\.com$/i.test(u.hostname)) return null
    const parts = u.pathname.replace(/\.git$/, '').split('/').filter(Boolean)
    if (parts.length < 2) return null
    return { owner: parts[0], repo: parts[1] }
  } catch {
    return null
  }
}

async function gh(pathname) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'risaddex-dsh-plugins-index-sync',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  const res = await fetch(`${API}${pathname}`, { headers })
  if (res.status === 404) return null
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub ${res.status} ${pathname}: ${body.slice(0, 200)}`)
  }
  return res.json()
}

async function listReleases(owner, repo) {
  const out = []
  for (let page = 1; page <= 10; page++) {
    const batch = await gh(`/repos/${owner}/${repo}/releases?per_page=100&page=${page}`)
    if (!batch) return null // repo inaccessible
    if (!Array.isArray(batch) || batch.length === 0) break
    out.push(...batch)
    if (batch.length < 100) break
  }
  return out
}

async function resolveTagCommit(owner, repo, tag) {
  const ref = await gh(`/repos/${owner}/${repo}/git/ref/tags/${encodeURIComponent(tag)}`)
  if (!ref || !ref.object) return null
  if (ref.object.type === 'commit') return ref.object.sha
  if (ref.object.type === 'tag') {
    const annotated = await gh(`/repos/${owner}/${repo}/git/tags/${ref.object.sha}`)
    if (annotated?.object?.sha) return annotated.object.sha
  }
  return null
}

async function readPackageJson(owner, repo, commit, directory) {
  const filePath = directory ? `${directory.replace(/^\/+|\/+$/g, '')}/package.json` : 'package.json'
  const meta = await gh(`/repos/${owner}/${repo}/contents/${filePath}?ref=${encodeURIComponent(commit)}`)
  if (!meta || meta.type !== 'file' || !meta.content) return null
  const raw = Buffer.from(meta.content, meta.encoding === 'base64' ? 'base64' : 'utf8').toString('utf8')
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Map a release tag to a SemVer string for this plugin, or null if it does not belong. */
function versionFromTag(tag, pluginName, hasDirectory) {
  const t = String(tag || '').trim()
  if (!t) return null
  // Monorepo-style: name@1.2.3 or name-v1.2.3
  const at = new RegExp(`^${escapeRegExp(pluginName)}@(.+)$`, 'i').exec(t)
  if (at && parseSemver(at[1])) return parseSemver(at[1]).raw
  const dashed = new RegExp(`^${escapeRegExp(pluginName)}-v?(\\d+\\.\\d+\\.\\d+.*)$`, 'i').exec(t)
  if (dashed && parseSemver(dashed[1])) return parseSemver(dashed[1]).raw
  // Standalone repos only: v1.2.3 / 1.2.3
  if (!hasDirectory) {
    const plain = parseSemver(t)
    if (plain) return plain.raw
  }
  return null
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function newestIndexed(versions) {
  let best = null
  for (const v of versions || []) {
    if (!v?.version || !parseSemver(v.version)) continue
    if (best == null || cmpSemver(v.version, best) > 0) best = v.version
  }
  return best
}

function sortVersionsDesc(versions) {
  return [...versions].sort((a, b) => cmpSemver(b.version, a.version))
}

function toUnixSeconds(iso) {
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return Math.floor(Date.now() / 1000)
  return Math.floor(ms / 1000)
}

async function syncPlugin(plugin) {
  const repoInfo = githubRepo(plugin.repository?.url)
  if (!repoInfo) {
    console.log(`- ${plugin.name}: skip (no github repository.url)`)
    return { changed: false, added: [] }
  }
  const hasDirectory = Boolean(plugin.repository?.directory)
  const releases = await listReleases(repoInfo.owner, repoInfo.repo)
  if (releases == null) {
    console.log(`- ${plugin.name}: skip (repo ${repoInfo.owner}/${repoInfo.repo} not accessible)`)
    return { changed: false, added: [] }
  }
  if (releases.length === 0) {
    console.log(`- ${plugin.name}: no releases`)
    return { changed: false, added: [] }
  }

  const currentNewest = newestIndexed(plugin.versions)
  const known = new Set((plugin.versions || []).map((v) => v.version))
  const candidates = []

  for (const rel of releases) {
    if (rel.draft || rel.prerelease) continue
    const version = versionFromTag(rel.tag_name, plugin.name, hasDirectory)
    if (!version) continue
    if (known.has(version)) continue
    if (currentNewest && cmpSemver(version, currentNewest) <= 0) continue
    candidates.push({ release: rel, version })
  }

  if (candidates.length === 0) {
    console.log(`- ${plugin.name}: up to date (newest indexed ${currentNewest || 'none'})`)
    return { changed: false, added: [] }
  }

  candidates.sort((a, b) => cmpSemver(b.version, a.version))
  const added = []

  for (const { release, version } of candidates) {
    const commit = await resolveTagCommit(repoInfo.owner, repoInfo.repo, release.tag_name)
    if (!commit || !/^[0-9a-f]{40}$/i.test(commit)) {
      console.warn(`  ! ${plugin.name}@${version}: could not resolve commit for tag ${release.tag_name}`)
      continue
    }
    const pkg = await readPackageJson(
      repoInfo.owner,
      repoInfo.repo,
      commit,
      plugin.repository?.directory,
    )
    const source = {
      type: 'git',
      url: plugin.repository.url.replace(/\.git$/, ''),
      commit: commit.toLowerCase(),
    }
    if (plugin.repository?.directory) source.path = plugin.repository.directory

    const entry = {
      version,
      publishTimestamp: toUnixSeconds(release.published_at),
      source,
    }
    const engines = pkg?.dsh?.engines || pkg?.engines
    if (engines && typeof engines === 'object') {
      const dsh = engines.dsh || engines['deepseek-harness']
      if (typeof dsh === 'string' && dsh.trim()) entry.engines = { dsh: dsh.trim() }
    }
    added.push(entry)
  }

  if (added.length === 0) return { changed: false, added: [] }

  plugin.versions = sortVersionsDesc([...(plugin.versions || []), ...added])
  console.log(`- ${plugin.name}: +${added.map((a) => a.version).join(', ')}`)
  return { changed: true, added }
}

function renderReadme(index) {
  const rows = (index.plugins || []).map((p) => {
    const newest = newestIndexed(p.versions) || (p.versions?.[0]?.version ?? '?')
    const home = p.homepage || p.repository?.url || '#'
    const desc = typeof p.description === 'string' ? p.description : p.description?.en || ''
    return `| [${p.name}](${home}) | ${newest} | ${desc} |`
  })

  return `# dsh-plugins-index

Public plugin-market index (format 1) for [risaddex's DeepSeek Harness plugins](https://github.com/risaddex?tab=repositories&q=dsh).

This repository contains only the generated index: the plugin sources stay in their own
repositories. It is public because the DSH plugin market fetches an index over plain
HTTP without credentials, while some plugin repositories may be private.

| Plugin | Version | What it does |
| - | - | - |
${rows.join('\n')}

## Add it to DeepSeek Harness

1. Open **Settings → Plugin market → Add index** (or **Plugins → Discover → Add index**).
2. Paste https://raw.githubusercontent.com/risaddex/dsh-plugins-index/main/index.json.

Install specs are git+ URLs pinned to a commit. A plugin hosted in a private
repository needs GitHub credentials available to git on the installing machine
(for example, run \`gh auth login\` first). Plugins in public repositories install
for anyone.

## Keeping versions fresh

\`.github/workflows/sync-releases.yml\` runs on a schedule (and on \`workflow_dispatch\`)
and prepends any newer **GitHub Release** it can see for each plugin:

- standalone repos: tags \`vX.Y.Z\` / \`X.Y.Z\`
- monorepo packages (\`repository.directory\` set): tags \`name@X.Y.Z\` or \`name-vX.Y.Z\`

Repos without a matching release are left untouched. Private repos need a
\`INDEX_SYNC_TOKEN\` secret (classic PAT or fine-grained with contents:read on those repos);
public repos work with the default \`GITHUB_TOKEN\`.
`
}

async function main() {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'))
  if (index.format !== 1 || !Array.isArray(index.plugins)) die('index.json is not a format-1 plugin index')

  let changed = false
  const summary = []
  for (const plugin of index.plugins) {
    const result = await syncPlugin(plugin)
    if (result.changed) {
      changed = true
      summary.push(`${plugin.name}: ${result.added.map((a) => a.version).join(', ')}`)
    }
  }

  const readme = renderReadme(index)
  const prevReadme = fs.existsSync(path.join(ROOT, 'README.md'))
    ? fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
    : ''
  const readmeChanged = readme !== prevReadme

  if (!changed && !readmeChanged) {
    console.log('No index changes.')
    return
  }

  if (DRY_RUN) {
    console.log('DRY_RUN=1 — not writing. Would update:')
    for (const line of summary) console.log('  ' + line)
    if (readmeChanged) console.log('  README.md')
    return
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + '\n')
  fs.writeFileSync(path.join(ROOT, 'README.md'), readme)
  console.log('Wrote index.json' + (readmeChanged ? ' + README.md' : ''))
  if (summary.length) console.log('Added:\n' + summary.map((s) => '  ' + s).join('\n'))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
