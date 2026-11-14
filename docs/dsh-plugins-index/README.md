# dsh-plugins-index

Public plugin-market index (format 1) for [risaddex's DeepSeek Harness plugins](https://github.com/risaddex?tab=repositories&q=dsh).

This repository contains only the generated index: the plugin sources stay in their own
repositories. It is public because the DSH plugin market fetches an index over plain
HTTP without credentials, while some plugin repositories may be private.

| Plugin | Version | What it does |
| - | - | - |
| [dsh-plugin-auto-review-allow](https://github.com/risaddex/dsh-plugins/tree/main/packages/dsh-plugin-auto-review-allow) | 0.2.0 | Exempt named tools from the experimental Auto review gate, with a reason per entry, plus per-session grants granted from a three-option card and revocable from settings. |
| [dsh-plugin-langsmith](https://github.com/risaddex/dsh-plugins/tree/main/packages/dsh-plugin-langsmith) | 0.1.0 | Traces every DeepSeek Harness turn, step, model call and tool call into LangSmith — prompts, tool results, token usage, subagent trees and subscription model/account labels. Configured from Settings → Plugins. |
| [dsh-plugin-linear](https://github.com/risaddex/dsh-plugins/tree/main/packages/dsh-plugin-linear) | 0.1.0 | Adds a Linear entry to the left sidebar: the newest issues assigned to you and the issues waiting in review states, from every configured Linear workspace (multi-account). Also gives the agent linear_accounts / linear_issues / linear_issue with explicit alias:IDENTIFIER refs. |
| [dsh-plugin-ombrello-toolset](https://github.com/risaddex/dsh-plugins/tree/main/packages/dsh-plugin-ombrello-toolset) | 0.1.0 | Connects the Ombrello toolset MCP server hosted on the Obot gateway and adds OAuth 2.0 sign-in with automatic token refresh. The gateway tools appear as mcp__ombrello_toolset__* and the bearer token is kept in the credentials store, never in configuration. |
| [dsh-plugin-pencil](https://github.com/risaddex/dsh-plugins/tree/main/packages/dsh-plugin-pencil) | 0.1.0 | Connects the Pencil app (pen.dev) over stdio MCP so the agent can read, generate and validate .pen designs in the document open in the app. The tools appear as mcp__pencil__get_app_state, get_style, read_skill, execute, browser and save. Requires Pen.app running; tool calls stay on this machine. |
| [dsh-plugin-pr-autofix](https://github.com/risaddex/dsh-plugins/tree/main/packages/dsh-plugin-pr-autofix) | 0.4.0 | Watches the session's pull request on GitHub (github.com or Enterprise) or a self-hosted Gitea instance (gt CLI on Gitea 28+, tea fallback) and wakes the agent with a <ci-monitor-event> on CI failures, merge conflicts and new review comments. Adds a PR Auto-fix tab to the right sidebar; complements dsh-git-manager. |
| [dsh-plugin-secure-env-ingress](https://github.com/risaddex/dsh-plugins/tree/main/packages/dsh-plugin-secure-env-ingress) | 0.1.1 | One-use HTTPS forms that carry a secret from the human to the dsh-vault without ever entering chat, tool output or the model context. Adds secure_env_request / secure_env_await / secure_env_status / secure_env_cancel / secure_operation and writes through the vault's own tools, so its encryption and approval policy still apply. |
| [dsh-notifier](https://github.com/risaddex/dsh-notifier) | 0.13.1 | Outbound notifications across 28 chat and push channels plus 6 inbound control channels, with a native Notify & Control UI and live outbound configuration. |
| [dsh-plugin-ai-memory](https://github.com/risaddex/dsh-plugin-ai-memory) | 0.2.0 | Runs the ai-memory lifecycle hooks, wires the ai-memory MCP server (local or remote workstream) and adds a left-rail panel to configure and verify the connection. |
| [dsh-prompt](https://github.com/risaddex/dsh-prompt) | 0.5.1 | Prompt toolbox for DeepSeek Harness with English default UI, Portuguese option, and 24 localized preset bodies — one click inserts the template into the composer. |

## Add it to DeepSeek Harness

1. Open **Settings → Plugin market → Add index** (or **Plugins → Discover → Add index**).
2. Paste https://raw.githubusercontent.com/risaddex/dsh-plugins-index/main/index.json.

Install specs are git+ URLs pinned to a commit. A plugin hosted in a private
repository needs GitHub credentials available to git on the installing machine
(for example, run `gh auth login` first). Plugins in public repositories install
for anyone.

## Keeping versions fresh

`.github/workflows/sync-releases.yml` runs on a schedule (and on `workflow_dispatch`)
and prepends any newer **GitHub Release** it can see for each plugin:

- standalone repos: tags `vX.Y.Z` / `X.Y.Z`
- monorepo packages (`repository.directory` set): tags `name@X.Y.Z` or `name-vX.Y.Z`

Repos without a matching release are left untouched. Private repos need a
`INDEX_SYNC_TOKEN` secret (classic PAT or fine-grained with contents:read on those repos);
public repos work with the default `GITHUB_TOKEN`.
