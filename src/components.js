import { navGroups } from "./data.js";
import { escapeHTML as e, rankModels } from "./core.js";
export const arrow = '<span aria-hidden="true">↗</span>';
export function logo() {
  return `<a class="logo" href="/" aria-label="Ocular AI — Home"><svg aria-hidden="true" focusable="false" viewBox="0 0 74 28"><rect x="2" y="3" width="70" height="22" rx="11" fill="none" stroke="currentColor" stroke-width="3"/><rect x="9" y="9" width="43" height="10" rx="5" fill="currentColor"/></svg><span aria-hidden="true">Ocular</span></a>`;
}
const links = (items) =>
  items.map(([name, url]) => `<a href="${url}">${name}</a>`).join("");
export function header() {
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="header-inner">${logo()}<nav id="primary-nav" aria-label="Main navigation">${navGroups
    .slice(0, 3)
    .map(
      (group) =>
        `<div class="nav-group"><button class="nav-trigger" aria-expanded="false" aria-controls="nav-${group.name.split(" ")[0]}">${group.name}<span aria-hidden="true">⌄</span></button><div class="dropdown" id="nav-${group.name.split(" ")[0]}" hidden>${links(group.links)}</div></div>`,
    )
    .join(
      "",
    )}<a href="/enterprise">Enterprise</a><a href="/blog">Blog</a><div class="nav-group"><button class="nav-trigger" aria-expanded="false" aria-controls="nav-company">Company <span aria-hidden="true">⌄</span></button><div class="dropdown" id="nav-company" hidden>${links(navGroups[3].links)}</div></div><a class="careers-link" href="/careers">Careers <span class="small-badge">↗</span></a></nav><a class="button primary header-cta" href="/contact">Get Data ${arrow}</a><button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="primary-nav"><span></span><span></span></button></div></header>`;
}
export function footer() {
  return `<section class="closing-cta wrap"><p>Ready to bring AI<br>into the real world?</p><a class="button primary" href="/contact">Get Data ${arrow}</a></section><footer class="site-footer wrap"><div class="footer-top">${logo()}<p>Human expertise.<br>Machine intelligence.</p></div><div class="footer-columns"><div><h3>Research</h3>${links(navGroups[0].links)}</div><div><h3>Products</h3>${links(navGroups[1].links)}</div><div><h3>Company</h3>${links(
    [
      ["Expert Network", "/experts"],
      ["Enterprise", "/enterprise"],
      ["Blog", "/blog"],
      ["Careers", "/careers"],
      ["Contact", "/contact"],
    ],
  )}</div><div><h3>Get in touch</h3>${links([
    ["sales@useocular.com", "mailto:sales@useocular.com"],
    ["research@useocular.com", "mailto:research@useocular.com"],
    ["LinkedIn ↗", "https://www.linkedin.com/company/use-ocular"],
    ["GitHub ↗", "https://github.com/OcularEngineering"],
  ])}</div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Ocular AI, Inc.</span><span>San Francisco, California</span><div>${links(
    [
      ["Privacy", "https://www.useocular.com/privacy"],
      ["Terms", "https://www.useocular.com/terms"],
    ],
  )}<button class="text-button" id="privacy-open">Privacy choices</button></div></div></footer><dialog id="privacy-dialog" aria-labelledby="privacy-title"><form method="dialog"><div class="dialog-heading"><h2 id="privacy-title">Privacy choices</h2><button class="icon-button" aria-label="Close privacy preferences">×</button></div><p>This local preview uses no analytics or tracking cookies. Your catalogue filters stay in the page URL.</p><button class="button primary">Done</button></form></dialog>`;
}
export function bindNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  const closeGroups = (except) =>
    document.querySelectorAll(".nav-trigger").forEach((b) => {
      if (b !== except) {
        b.setAttribute("aria-expanded", "false");
        document.getElementById(b.getAttribute("aria-controls")).hidden = true;
      }
    });
  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    closeGroups();
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    if (open) nav.querySelector(".nav-trigger").focus();
    else closeGroups();
  });
  document.querySelectorAll(".nav-trigger").forEach((button) => {
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      closeGroups(button);
      button.setAttribute("aria-expanded", String(open));
      document.getElementById(button.getAttribute("aria-controls")).hidden =
        !open;
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (button.getAttribute("aria-expanded") !== "true") button.click();
        document
          .getElementById(button.getAttribute("aria-controls"))
          .querySelector("a")
          .focus();
      }
    });
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const open = document.querySelector('.nav-trigger[aria-expanded="true"]');
      if (open) {
        closeGroups();
        open.focus();
      } else if (toggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        toggle.focus();
      }
    }
  });
  document
    .querySelector(".site-header")
    .addEventListener("focusout", (event) => {
      if (
        event.relatedTarget &&
        !event.currentTarget.contains(event.relatedTarget)
      )
        closeMenu();
    });
  matchMedia("(min-width: 1100px)").addEventListener("change", closeMenu);
  document
    .querySelector("#privacy-open")
    .addEventListener("click", () =>
      document.querySelector("#privacy-dialog").showModal(),
    );
}
export function benchmark(id, kind, data, { compact = false } = {}) {
  const metrics = Object.keys(data[kind][0].scores);
  return `<section class="benchmark ${compact ? "compact" : ""}" id="${id}" data-kind="${kind}" aria-label="${kind === "stt" ? "Speech-to-text" : "Diarization"} leaderboard"><div class="benchmark-tools"><div class="metric-control"><span class="mono">Metric</span><div class="metric-buttons" role="group" aria-label="Benchmark metric">${metrics.map((metric, i) => `<button data-metric="${e(metric)}" aria-pressed="${i === 0}">${e(metric)}</button>`).join("")}</div></div>${compact ? "" : `<div class="board-filters"><label>Models<select name="modelAccess"><option>All</option><option>Open Source</option><option>Proprietary</option></select></label><label>Find a model<input type="search" name="modelSearch" placeholder="Search models"></label></div>`}</div><p class="metric-help">${kind === "stt" ? "Transcription error rate" : "Speaker attribution error rate"}. Lower is better.</p><div class="board-heading mono"><span>Model</span><span>Score</span></div><ol class="model-list"></ol><p class="board-status sr-only" role="status"></p>${compact ? `<a class="board-more" href="/converse/${kind}">Explore all ${data[kind].length} models <span aria-hidden="true">↗</span></a>` : '<p class="source-note">Snapshot: October 18, 2026 · <a href="https://www.useocular.com/converse/' + kind + '">Ocular Converse benchmark ↗</a></p>'}</section>`;
}
export function bindBenchmark(element, data) {
  const kind = element.dataset.kind;
  let metric = Object.keys(data[kind][0].scores)[0];
  let access = "All",
    query = "";
  const compact = element.classList.contains("compact");
  const update = () => {
    const models = rankModels(data[kind], metric, access, query);
    const rows = compact ? models.slice(0, 5) : models;
    const max =
      metric === "Speaker Count"
        ? 100
        : kind === "stt"
          ? Math.max(15, ...models.map((m) => m.scores[metric]))
          : Math.max(60, ...models.map((m) => m.scores[metric]));
    element.querySelector(".model-list").innerHTML =
      rows
        .map(
          (m, i) =>
            `<li><span class="rank mono">${String(i + 1).padStart(2, "0")}</span><div class="model-detail"><div class="model-heading"><a href="${e(m.url)}">${e(m.name)}</a><span class="score">${m.scores[metric].toFixed(2)}%</span></div><div class="bar-track" aria-hidden="true"><div style="width:${(m.scores[metric] / max) * 100}%;--bar-color:${["#e5b597", "#bad6da", "#c4c69c", "#bbb0ce", "#e0ceab"][i % 5]}"></div></div></div></li>`,
        )
        .join("") ||
      '<li class="empty-state">No models match your search.</li>';
    element.querySelector(".metric-help").textContent =
      metric === "Speaker Count"
        ? "Correct speaker count. Higher is better."
        : `${metric === "JER" ? "Jaccard error rate" : metric === "CER" ? "Character error rate" : metric === "WER" ? "Word error rate" : metric.includes("collar") ? "Diarization error rate, with a 0.25-second boundary tolerance" : "Diarization error rate"}. Lower is better.`;
    element.querySelector(".board-status").textContent =
      `${models.length} models, ranked by ${metric}.`;
    element
      .querySelectorAll("[data-metric]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.metric === metric)),
      );
  };
  element.querySelectorAll("[data-metric]").forEach((b) =>
    b.addEventListener("click", () => {
      metric = b.dataset.metric;
      update();
    }),
  );
  element
    .querySelector('[name="modelAccess"]')
    ?.addEventListener("change", (event) => {
      access = event.target.value;
      update();
    });
  element
    .querySelector('[name="modelSearch"]')
    ?.addEventListener("input", (event) => {
      query = event.target.value;
      update();
    });
  update();
}
