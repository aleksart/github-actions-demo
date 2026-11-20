# github-actions-demo

Learning sandbox for GitHub Actions: a Bun-workspaces monorepo with two small dashboards modeled on [Finmap](https://www.finmap.online) reports (cash flow and P&L). The apps are intentionally minimal; the workflows are the point.

## Layout

| Path                             | What                                                              |
| -------------------------------- | ----------------------------------------------------------------- |
| `apps/cashflow`                  | Cashflow dashboard (Vite + React + Recharts)                      |
| `apps/pnl`                       | P&L dashboard                                                     |
| `packages/core`                  | Shared types, seed data, pure calculations, `bun test` unit tests |
| `.github/workflows`              | CI/CD workflows (map below)                                       |
| `.github/actions/setup-bun-deps` | Composite action: Bun, cache, frozen install                      |

## Local commands

```sh
bun install
bun run dev:cashflow   # or dev:pnl
bun run lint && bun run typecheck && bun test && bun run build
actionlint             # lint workflows (brew install actionlint)
```

## Workflow map

| File                | Trigger               | Concepts                                                                                                        |
| ------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `ci.yml`            | push, PR, manual      | concurrency, paths-filter change detection, composite action, reusable workflow calls, `ci-gate` required check |
| `_build-app.yml`    | `workflow_call`       | inputs, outputs, artifacts                                                                                      |
| `deploy-pages.yml`  | push to main          | matrix over reusable workflow, Pages permissions (OIDC), environments                                           |
| `release.yml`       | tag `v*`              | tags, `GITHUB_TOKEN`, `gh release create`, release assets                                                       |
| `codeql.yml`        | push, PR, weekly cron | scheduled runs, security-events permission                                                                      |
| `manual-deploy.yml` | manual                | `workflow_dispatch` inputs, environment with required reviewers                                                 |
| `dependabot.yml`    | weekly                | action and dependency updates                                                                                   |

## One-time repo settings

- Settings > Pages > Source: **GitHub Actions**.
- Settings > Environments > `production`: add required reviewers.
- Branch protection on `main`: require the **CI gate** check.

## Exercises

1. Change only `apps/pnl/**` in a PR; confirm `build-cashflow` is skipped and `CI gate` still passes.
2. Break a unit test in `packages/core`; confirm both app builds are blocked by `verify`.
3. Pin every third-party action to a commit SHA.
4. Push tag `v0.1.0`; check the Release assets.
5. Add a Playwright smoke test job that runs against the built `dist`.

Deployed (after first push to `main`): `https://<user>.github.io/github-actions-demo/cashflow/` and `/pnl/`.
