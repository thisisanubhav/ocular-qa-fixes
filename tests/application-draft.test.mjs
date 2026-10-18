import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
let server, browser;
const results = [];
const role = 'strategic-project-associate';
const secondRole = 'founding-frontend-engineer';
const values = {
  firstName: 'QA-DRAFT', lastName: 'Tester', email: 'qa@example.test',
  phone: '+1 555 0100', currentTitle: 'Researcher', currentCompany: 'Local QA',
  linkedin: 'linkedin.com/in/qa-test', portfolio: 'example.test',
  challenge: 'A difficult problem.\n\nA second paragraph with the solution.',
  note: 'Draft retention check only. Do not submit. <text stays literal>',
};
async function evidence(path, contents) {
  if (!process.env.CAPTURE_APPLICATION_EVIDENCE) return;
  await writeFile(path, contents);
  execFileSync('git', ['add', '--', path]);
  try { execFileSync('git', ['diff', '--cached', '--quiet', '--', path]); }
  catch { execFileSync('git', ['commit', '-m', `Capture ${path}`], { stdio: 'ignore' }); }
}
before(async () => {
  server = spawn(process.execPath, ['scripts/server.mjs'], { env: { ...process.env, PORT: '3220' }, stdio: ['ignore', 'pipe', 'pipe'] });
  await once(server.stdout, 'data');
  browser = await chromium.launch({ channel: 'chrome', headless: true });
});
after(async () => {
  await browser?.close();
  server?.kill();
  if (results.length) await evidence('evidence/after/application-draft-results.json', JSON.stringify({ browser: 'Isolated Chromium', widths: [320,390,768,1024,1440], results, applicationRequests: 0, attachmentUploads: 0, persistence: 'Per role, while the careers page remains open' }, null, 2));
});
for (const width of [320,390,768,1024,1440]) {
  test(`application draft survives details, close, and role switches at ${width}px`, async () => {
    const page = await browser.newPage({ viewport: { width, height: width === 768 ? 1024 : 900 } });
    const outbound = [], errors = [];
    page.on('request', request => { if (request.method() !== 'GET') outbound.push(request.url()); });
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto('http://localhost:3220/careers');
      const open = async id => {
        await page.locator(`[data-role="${id}"]`).click();
        await page.getByRole('button', { name: 'Apply Now', exact: true }).click();
      };
      const currentForm = id => page.locator(`[data-role-view="${id}"] form`);
      const snapshot = async id => currentForm(id).evaluate(form => ({
        fields: Object.fromEntries([...form.querySelectorAll('input:not([type=file]),textarea')].map(field => [field.name, field.value])),
        file: form.elements.resume.files[0]?.name,
      }));
      await open(role);
      const form = currentForm(role);
      for (const [name, value] of Object.entries(values)) await form.locator(`[name="${name}"]`).fill(value);
      await form.locator('[name="resume"]').setInputFiles({ name: 'qa-resume.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\nLocal synthetic QA fixture only.\n%%EOF') });
      const expected = await snapshot(role);
      assert.deepEqual(expected.fields, values);
      await page.getByRole('button', { name: 'Back to role details', exact: true }).click();
      await page.getByRole('button', { name: 'Apply Now', exact: true }).click();
      assert.deepEqual(await snapshot(role), expected);
      assert.ok(await page.locator('#application-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await form.locator('[name="firstName"]').scrollIntoViewIfNeeded();
      await evidence(`evidence/after/application-draft-${width}.png`, await page.screenshot());
      // Native dialog Escape closes without discarding and restores the opener.
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#application-dialog').evaluate(el => el.open), false);
      assert.equal(await page.evaluate(() => document.activeElement.dataset.role), role);
      await open(secondRole);
      const other = currentForm(secondRole);
      assert.equal(await other.locator('[name="firstName"]').inputValue(), '');
      assert.equal(await other.locator('[name="resume"]').evaluate(el => el.files.length), 0);
      await other.locator('[name="firstName"]').fill('SEPARATE-ROLE');
      await page.getByRole('button', { name: 'Close application', exact: true }).click();
      await open(role);
      assert.deepEqual(await snapshot(role), expected);
      // Cancelled discard keeps everything, including the same file selection.
      await page.getByRole('button', { name: 'Discard draft', exact: true }).click();
      await page.getByRole('button', { name: 'Keep draft', exact: true }).click();
      assert.deepEqual(await snapshot(role), expected);
      await page.getByRole('button', { name: 'Test application', exact: true }).click();
      assert.match(await form.locator('[role="status"]').textContent(), /Nothing was submitted or uploaded/);
      assert.deepEqual(await snapshot(role), expected);
      // Reload attempts warn; declining the warning keeps the in-memory draft.
      let warned = false;
      page.once('dialog', async dialog => { warned = dialog.type() === 'beforeunload'; await dialog.dismiss(); });
      await page.reload({ timeout: 3000 }).catch(error => {
        if (!/ERR_ABORTED|Timeout|net::/i.test(error.message)) throw error;
      });
      assert.equal(warned, true);
      assert.deepEqual(await snapshot(role), expected);
      await page.getByRole('button', { name: 'Discard draft', exact: true }).click();
      await page.getByRole('button', { name: 'Discard this draft', exact: true }).click();
      const cleared = await snapshot(role);
      assert.ok(Object.values(cleared.fields).every(value => value === ''));
      assert.equal(cleared.file, undefined);
      await page.getByRole('button', { name: 'Close application', exact: true }).click();
      await open(secondRole);
      assert.equal(await other.locator('[name="firstName"]').inputValue(), 'SEPARATE-ROLE');
      assert.deepEqual(outbound, []);
      assert.deepEqual(errors, []);
      results.push({ width, passed: true, preservedFields: Object.keys(values), resume: 'qa-resume.pdf', checks: ['details round-trip', 'Escape and focus restoration', 'close and reopen', 'role isolation', 'cancel discard', 'local test retains draft', 'reload warning', 'explicit discard clears only active role', 'no overflow', 'no outbound application or upload'] });
    } finally { await page.close(); }
  });
}
