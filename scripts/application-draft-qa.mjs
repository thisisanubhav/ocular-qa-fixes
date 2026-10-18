import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' });
async function save(path, content) {
  await writeFile(path, content);
  execFileSync('git', ['add', '--', path]);
  try { execFileSync('git', ['diff', '--cached', '--quiet', '--', path]); }
  catch { execFileSync('git', ['commit', '-m', `Capture ${path}`], { stdio: 'ignore' }); }
}
try {
  await page.goto('https://www.useocular.com/careers');
  await page.getByRole('button', { name: /Strategic Project Associate.*opening/ }).click();
  await page.getByRole('button', { name: 'Apply Now', exact: true }).click();
  await page.getByRole('textbox', { name: 'First name', exact: true }).fill('QA-DRAFT');
  await page.getByRole('textbox', { name: 'Note to the team', exact: true }).fill('Draft retention check only. Do not submit.');
  await page.getByRole('button', { name: 'Back to role details', exact: true }).click();
  await page.getByRole('button', { name: 'Apply Now', exact: true }).click();
  const actual = { firstName: await page.getByRole('textbox', { name: 'First name', exact: true }).inputValue(), note: await page.getByRole('textbox', { name: 'Note to the team', exact: true }).inputValue() };
  assert.deepEqual(actual, { firstName: '', note: '' });
  await save('evidence/before/application-draft.json', JSON.stringify({ url: page.url(), entered: { firstName: 'QA-DRAFT', note: 'Draft retention check only. Do not submit.' }, afterReopen: actual, submitted: false }, null, 2));
  await page.getByRole('textbox', { name: 'First name', exact: true }).scrollIntoViewIfNeeded();
  await save('evidence/before/application-draft.png', await page.screenshot());
  console.log('Reproduced production draft loss; no submission or attachment upload.');
} finally { await browser.close(); }
