# Open Source Readiness

Status: Needs work

## Ready

- Project uses a clean Next.js structure suitable for Vercel.
- No server-side secrets or environment variables are required.
- Bookmarklet source is separated from the installer UI.
- README, contribution guide, security notes, changelog, issue templates, and PR template are present.
- Local generated exports such as CSV files are ignored.

## Needs Work Before Public Release

- Confirm and add a formal open-source license, such as MIT or Apache-2.0. This is practical engineering guidance, not legal advice.
- Add a public demo URL after Vercel deployment.
- Add screenshots or a short GIF if they do not expose private B 站 data.
- Re-run secret checks before publishing.

## Sensitive Content Review

- Do not commit Cookie values, `SESSDATA`, `bili_jct`, local CSV exports, screenshots with private account data, or raw API responses.
- This repository should be published as a clean repo rather than reusing private experiment history.

## Suggested Publish Steps

1. Confirm license.
2. Run `npm run verify:bookmarklet`.
3. Run `npm run build`.
4. Deploy to Vercel.
5. Add the demo URL to `README.md`.
