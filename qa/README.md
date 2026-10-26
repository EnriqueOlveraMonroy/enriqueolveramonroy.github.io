# Optional quality checks

These tools run locally and are not loaded by the website. The production website has no package dependencies.

## Static checks (Node.js)

From the repository root:

```sh
node qa/check-site.mjs
```

Checks local files, translations, IDs, links, metadata, structured-data CSP hash, project count and the CV PDF signature. Exits with a nonzero status if a check fails.

## Browser flows (Playwright CLI)

Start `python3 qa/serve.py` first. With Node.js and npm available, run in another terminal from the repository root:

```sh
npx --package @playwright/cli playwright-cli -s=portfolio open http://127.0.0.1:8000/
npx --package @playwright/cli playwright-cli -s=portfolio run-code --filename qa/browser-flows.cjs
npx --package @playwright/cli playwright-cli -s=portfolio close
```

The optional command downloads the CLI if needed; it does not add runtime dependencies to the portfolio. The CLI requires an available compatible browser. The test returns a pass summary or throws with failed checks. It checks EN/ES, all filters and previews, zoom/focus, keyboard navigation, CV download, reduced motion, history, storage denial, network failure/retry, no-JS fallback and CSP behavior. Deliberate failures are isolated from normal-flow checks.

Automated flows are not a complete accessibility or cross-browser certification. The full audit also used axe and Lighthouse; original JSON evidence and comparison screenshots are in the separate evidence package. Known contrast findings are documented in `docs/AUDITORIA-2026-10-26.md`.

When updating JSON-LD, calculate the CSP hash from the exact UTF-8 text between its script tags. `qa/check-site.mjs` detects an outdated hash. Do not enable arbitrary inline scripts to make this check pass.
