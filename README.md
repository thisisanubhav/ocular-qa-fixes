# Ocular website reconstruction

A local implementation of Ocular’s audited public website journeys. The supplied Git repository was empty, so this is new source code, not a patch to the production application. It follows the audit’s dark visual reference and fixes its initial four findings plus application draft retention in the local implementation.

## Run

Requires Node.js 20+.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Application runtime uses native JavaScript modules and Node’s HTTP server; Playwright is a development dependency only.

```sh
npm test              # Six unit/API tests + five application-flow tests; requires Chrome
npm run build         # Static files in dist/
npm run test:browser  # Start npm run dev first; requires installed Google Chrome
```

To serve the packaged build with route fallback and the mock form endpoint:

```sh
SERVE_DIST=1 npm start
```

The browser suite launches an isolated Chrome profile. It never attaches to personal browser sessions. At the user’s request, evidence scripts commit each changed evidence file individually. The suite requires Git identity configuration and a clean index.

## Implemented flows

- Shared responsive navigation, keyboard-operated submenus, named header/footer home links, skip link, and privacy dialog.
- Three-slide homepage with benchmark previews and model counts derived from `src/benchmarks.json`.
- Fourteen-dataset marketplace with search, language filters, pagination, dataset details, and sample/licensing inquiry links.
- Contact form with a visible, editable URL subject, required-field validation, multiple selections, error recovery, and mock submission.
- Diarization and STT leaderboards with real public score snapshots, metric switching, model access filters, and search.
- Product, research, company, enterprise, experts, blog, and careers entry pages.
- Local role details and application forms with separate drafts per role. Fields and résumé selection survive returning to details, closing the panel, and switching roles. Discard requires confirmation; reloading or leaving warns before losing drafts.

## Audit fixes

| Finding | Implementation | Verification |
| --- | --- | --- |
| Tablet navigation clipped | Compact navigation below 1100 px; primary CTA stays outside the menu | Header bounds, menu keyboard entry/traversal/Escape, and screenshots at 320, 390, 768, 1024, and 1440 px |
| Missing inquiry context | Shared query parser fills an editable subject; payload includes its current value | Dataset CTA flow, five product inquiry flows, edited payload received by local mock, direct/encoded/unsafe-text URL cases |
| Unnamed home links | Both anchors use `aria-label="Ocular AI — Home"`; decorative logo SVGs are hidden from accessibility APIs | Chromium accessibility tree exposes both named links; no unnamed homepage links |
| Conflicting model count | Homepage, CTA badge, overview, and leaderboard derive counts from the same model arrays | Diarization displays 12 throughout; STT uses its 20 entries; metric rankings verified |
| Application draft silently erased | Keep each role’s form mounted above the details/application switch | All fields and a synthetic résumé preserved at five widths; close/reopen, role isolation, cancelled/confirmed discard, and reload warning verified |

## Source map

- `src/components.js`: header, footer, navigation behavior, reusable leaderboard.
- `src/app.js`: page rendering, carousel, catalogue, contact form, and route selection.
- `src/careers.js`: role previews, retained application forms, explicit draft discard, and navigation warning.
- `src/core.js`: query handling, escaping, pagination, model sorting, payload construction, validation.
- `src/data.js`: catalogue, product, and navigation content.
- `src/benchmarks.json`: October 18, 2026 public benchmark scores, captured from Ocular.
- `src/styles.css`: responsive layouts and focus styles.
- `scripts/server.mjs`: local serving and isolated mock API.
- `tests/` and `scripts/browser-qa.mjs`: regression checks.
- `evidence/index.html`: before/after report with screenshots and machine-readable results.

Application draft evidence: [before/after report](evidence/application-draft.html). To refresh its screenshots and JSON, run `CAPTURE_APPLICATION_EVIDENCE=1 node --test tests/application-draft.test.mjs`; this commits each changed evidence file individually. `node scripts/application-draft-qa.mjs` reproduces the production defect without submission.

## Boundaries

`POST /api/contact` validates and echoes the payload with `mode: "mock"`. It sends no email, stores no personal information, and makes no outbound request. The form visibly identifies this behavior. A production backend, delivery, spam protection, and deployment configuration are not provided.

The dataset catalogue and benchmark scores are snapshots, not live integrations. Waveforms are decorative illustrations, not playable recordings. The local application form is a test only: no network request, résumé upload, or application delivery occurs. Drafts live only in memory while the Careers page stays open; they are not restored after a confirmed reload or navigation. Detailed scientific reports, legal documents, current jobs, and expert application flows link to their official destinations. No applications, accounts, or real sales requests were created. No deployment was performed.

Browser validation covers Chromium viewport simulations, not Safari, Firefox, physical devices, or screen-reader speech output. The original production site remains unchanged.

References: [Ocular](https://www.useocular.com/), [Marketplace](https://www.useocular.com/human-data/marketplace), [Diarization](https://www.useocular.com/converse/diarization), [STT](https://www.useocular.com/converse/stt), and the supplied October 18 QA audit.
