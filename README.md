# Ocular QA fixes

An independent local reconstruction of Ocular’s audited website flows. The original source was unavailable, so these fixes demonstrate the corrected behavior without changing production.

## What’s broken

- **Tablet navigation:** Careers and Get Data are clipped at 768 px; the mobile menu is hidden.
- **Sample requests:** Dataset/product context appears in the URL but not in the contact form.
- **Home links:** Header and footer logo links have no accessible names.
- **Model counts:** The homepage says 11 diarization models; the leaderboard shows 12.
- **Application drafts:** Back to role details → Apply Now silently clears entered fields.

## Why it matters

- Tablet visitors lose access to important navigation and the sales CTA.
- Prospective customers must repeat their selection, risking incomplete inquiries.
- Screen-reader users cannot identify the logo links’ purpose.
- Conflicting counts undermine confidence in benchmark results.
- Applicants lose their work simply by reviewing a role again.

## How I fixed it

- Switch to compact navigation below 1100 px; keep Get Data visible and menus keyboard-accessible.
- Prefill an editable request subject and include its current value in the submission payload.
- Name both logo links **“Ocular AI — Home”** and hide decorative SVGs from accessibility APIs.
- Derive homepage, CTA, and leaderboard counts from the same model records.
- Retain a separate form per role, including résumé selection; confirm discard and warn before leaving with drafts.

## Verification

- **11 tests passed:** unit/API checks and application flows at five widths.
- **161 browser assertions passed:** navigation, forms, marketplace, benchmarks, and accessibility.
- Validated at **320, 390, 768, 1024, and 1440 px**; static build passes.
- [Before/after evidence](evidence/index.html) · [Application draft evidence](evidence/application-draft.html)

## Run locally

Requires Node.js 20+; browser tests require installed Google Chrome.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

```sh
npm test
npm run build
npm run test:browser # Keep the local dev server running
```

Evidence scripts commit changed evidence files individually, following this project’s requested workflow. They require a configured Git identity and clean index.

