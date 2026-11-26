# ضابط AI — Dhabit AI

Arabic-first full diacritization web app, structured as a Cloudflare Pages project with a Pages Function API and installable PWA shell.

## Features
- Full tashkeel or word-ending/إعراب mode
- Context-aware prompt instructing the model to use Arabic grammar and morphology
- Preserve existing diacritics option
- Copy and download output as UTF-8 text
- Responsive RTL interface and PWA install support

## Run locally
Requires Node.js and Wrangler:
```bash
npm install -g wrangler
npx wrangler pages dev .
```

## Configure the AI service
Set the API key as a secret (never put it in frontend JavaScript):
```bash
npx wrangler pages secret put OPENAI_API_KEY
```
Optional model/base URL settings can be configured as Pages environment variables:
- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `OPENAI_BASE_URL` (default OpenAI-compatible chat completions endpoint)

Deploy with Cloudflare Pages after connecting the repository. Set the build output directory to `.` and no build command is required.

## Android
This is an installable Progressive Web App (PWA). Deploy it over HTTPS, open the URL in Chrome on Android, then choose **Install app** / **Add to Home screen**. This provides an app-like Android installation without a separate APK build. A signed APK/TWA package can be added as a separate release step.

## Accuracy and safety
The model output is a best-effort linguistic suggestion, not a guaranteed scholarly i'rab. Ambiguous Arabic forms require context and expert review. Do not treat generated text as a verified Qur'anic or hadith transcription; compare sacred texts against an authoritative edition.

Cloudflare Pages compatibility date is pinned to `2026-11-25` for the current deployment environment.
