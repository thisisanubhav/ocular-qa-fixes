import { escapeHTML as e } from './core.js';

const roles = [
  { id: 'strategic-project-associate', title: 'Strategic Project Associate', team: 'Operations' },
  { id: 'strategic-project-lead', title: 'Strategic Project Lead', team: 'Operations' },
  { id: 'founding-frontend-engineer', title: 'Founding Frontend Engineer', team: 'Technical Staff' },
  { id: 'founding-backend-engineer', title: 'Founding Backend Engineer', team: 'Technical Staff' },
  { id: 'founding-machine-learning-engineer', title: 'Founding Machine Learning Engineer', team: 'Technical Staff' },
];

export function careerOpenings() {
  return `<section class="section" aria-labelledby="open-roles-title">
    <p class="eyebrow">Join the team</p><h2 id="open-roles-title">Explore roles</h2>
    <p class="role-snapshot">Roles from the audit snapshot. Check the official careers page for current availability.</p>
    <div class="role-list">${roles.map(role => `<button class="role-button" data-role="${role.id}" aria-haspopup="dialog"><span><strong>${e(role.title)}</strong><span>${role.team} · San Francisco, CA</span></span><span aria-hidden="true">↗</span></button>`).join('')}</div>
  </section><dialog id="application-dialog" class="application-dialog" aria-labelledby="application-role-title">
    <div class="application-dialog-heading"><div><p class="eyebrow" id="application-team"></p><h2 id="application-role-title" tabindex="-1"></h2></div><button type="button" class="icon-button" data-close-application aria-label="Close application">×</button></div>
    <div id="application-views"></div>
  </dialog>`;
}

function roleView(role) {
  const input = (label, name, type = 'text', required = false, autocomplete = '') => `<label class="field" for="${role.id}-${name}">${label}${required ? ' *' : ''}<input id="${role.id}-${name}" name="${name}" type="${type}" ${required ? 'required' : ''} ${autocomplete ? `autocomplete="${autocomplete}"` : ''}></label>`;
  const view = document.createElement('div');
  view.dataset.roleView = role.id;
  view.innerHTML = `<section data-role-details>
    <p>Explore the ${e(role.title)} role with Ocular’s ${role.team.toLowerCase()} team.</p>
    <p>For the full responsibilities, requirements, and current opening status, <a class="text-link" href="https://www.useocular.com/careers">view the official role listing ↗</a>.</p>
    <p class="preview-note">This local application preview keeps a separate draft for each role while this page stays open. Reloading or leaving the page clears drafts. Nothing is sent to Ocular.</p>
    <button type="button" class="button primary" data-apply>Apply Now <span aria-hidden="true">↗</span></button>
  </section><section data-application-view hidden>
    <h3 tabindex="-1" data-application-heading>Apply for ${e(role.title)}</h3>
    <p class="preview-note">Draft kept while you review this role or close this panel. This is a local test; your details and résumé are not uploaded.</p>
    <form class="form-grid" data-application-form>
      ${input('First name', 'firstName', 'text', true, 'given-name')}
      ${input('Last name', 'lastName', 'text', true, 'family-name')}
      ${input('Email', 'email', 'email', true, 'email')}
      ${input('Phone number', 'phone', 'tel', false, 'tel')}
      ${input('Current title', 'currentTitle', 'text', false, 'organization-title')}
      ${input('Current company', 'currentCompany', 'text', false, 'organization')}
      ${input('LinkedIn', 'linkedin')}${input('Portfolio / website', 'portfolio')}
      <label class="field full" for="${role.id}-resume">Résumé *<input id="${role.id}-resume" name="resume" type="file" accept=".pdf,.doc,.docx" required aria-describedby="${role.id}-resume-help"><span class="field-hint" id="${role.id}-resume-help">PDF, DOC, or DOCX · up to 10 MB. The selected file stays with this role’s draft.</span></label>
      <label class="field full" for="${role.id}-challenge">What’s the most difficult thing you’ve ever solved? Be brief (max 2 paragraphs).<textarea id="${role.id}-challenge" name="challenge" rows="4"></textarea></label>
      <label class="field full" for="${role.id}-note">Note to the team<textarea id="${role.id}-note" name="note" rows="4"></textarea></label>
      <div class="full form-submit"><button class="button primary" type="submit">Test application</button><span class="form-status" role="status" data-application-status></span></div>
    </form>
    <div class="application-actions"><button type="button" class="button secondary" data-back-to-role>Back to role details</button><button type="button" class="text-button" data-request-discard>Discard draft</button></div>
    <div class="draft-confirmation" data-discard-confirmation hidden role="group" aria-label="Confirm discarding this role’s draft"><p>Discard this role’s draft? All fields and the selected résumé will be cleared.</p><button type="button" class="button secondary" data-keep-draft>Keep draft</button><button type="button" class="button secondary" data-confirm-discard>Discard this draft</button></div>
  </section>`;
  return view;
}

export function bindCareerApplications() {
  const dialog = document.querySelector('#application-dialog');
  const container = dialog.querySelector('#application-views');
  // Own each form above the details/application view switch. Retaining the actual
  // form node also preserves FileList, selection, validity, and unsaved edits.
  // Nothing is serialized to browser storage or shared between role IDs.
  const draftsByRole = new Map();
  let opener;
  const title = dialog.querySelector('#application-role-title');
  function ensureRole(role) {
    if (draftsByRole.has(role.id)) return draftsByRole.get(role.id);
    const view = roleView(role);
    const details = view.querySelector('[data-role-details]');
    const application = view.querySelector('[data-application-view]');
    const form = view.querySelector('form');
    const confirmation = view.querySelector('[data-discard-confirmation]');
    const status = view.querySelector('[data-application-status]');
    const showDetails = () => {
      application.hidden = true;
      confirmation.hidden = true;
      details.hidden = false;
      title.focus();
      dialog.scrollTop = 0;
    };
    view.querySelector('[data-apply]').addEventListener('click', () => {
      details.hidden = true;
      application.hidden = false;
      view.querySelector('[data-application-heading]').focus();
      dialog.scrollTop = 0;
    });
    view.querySelector('[data-back-to-role]').addEventListener('click', showDetails);
    view.querySelector('[data-request-discard]').addEventListener('click', () => {
      confirmation.hidden = false;
      view.querySelector('[data-keep-draft]').focus();
    });
    view.querySelector('[data-keep-draft]').addEventListener('click', () => {
      confirmation.hidden = true;
      view.querySelector('[data-request-discard]').focus();
    });
    view.querySelector('[data-confirm-discard]').addEventListener('click', () => {
      form.reset();
      form.elements.resume.setCustomValidity('');
      confirmation.hidden = true;
      status.textContent = 'This role’s draft was discarded.';
      form.elements.firstName.focus();
    });
    form.elements.resume.addEventListener('change', () => {
      const file = form.elements.resume.files[0];
      form.elements.resume.setCustomValidity(file && (!/\.(pdf|docx?)$/i.test(file.name) || file.size > 10 * 1024 * 1024) ? 'Choose a PDF, DOC, or DOCX file no larger than 10 MB.' : '');
    });
    form.addEventListener('input', () => { status.textContent = ''; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      status.textContent = 'Local test complete. Nothing was submitted or uploaded. Your draft is still available.';
    });
    const draft = { view, form, showDetails };
    draftsByRole.set(role.id, draft);
    container.append(view);
    return draft;
  }
  document.querySelectorAll('[data-role]').forEach(button => button.addEventListener('click', () => {
    const role = roles.find(role => role.id === button.dataset.role);
    const draft = ensureRole(role);
    draftsByRole.forEach(item => { item.view.hidden = item !== draft; });
    title.textContent = role.title;
    dialog.querySelector('#application-team').textContent = `${role.team} / San Francisco, CA`;
    opener = button;
    dialog.showModal();
    draft.showDetails();
  }));
  dialog.querySelector('[data-close-application]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  window.addEventListener('beforeunload', event => {
    const dirty = [...draftsByRole.values()].some(({ form }) => [...form.querySelectorAll('input,textarea')].some(field => field.type === 'file' ? field.files.length > 0 : field.value !== ''));
    if (dirty) { event.preventDefault(); event.returnValue = ''; }
  });
}
