# Cloudflare Pages setup

This repository is connected to the Cloudflare Pages project `dhabit-ai`.

- Production branch: `main`
- Build command: leave empty
- Build output directory: `.`
- Root directory: `/`

## Required AI secret

In Cloudflare Dashboard, open Workers & Pages → `dhabit-ai` → Settings → Variables and Secrets. Add `OPENAI_API_KEY` as an encrypted secret for both Production and Preview environments, then redeploy.

Optional variable: `OPENAI_MODEL` (plain text; defaults to `gpt-4o-mini`). Never put the API key in frontend files or commit it to GitHub.

The site can load before the key is configured, but the text-diacritization endpoint will return a setup error until the secret is added.