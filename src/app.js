import { datasets, products, interests, useCases, research } from "./data.js";
import {
  escapeHTML as e,
  inquiryURL,
  inquirySubject,
  paginate,
  contactPayload,
  validateContact,
} from "./core.js";
import {
  header,
  footer,
  bindNavigation,
  benchmark,
  bindBenchmark,
  arrow,
} from "./components.js";
const data = await fetch("/src/benchmarks.json").then((r) => r.json());
const path = location.pathname.replace(/\/$/, "") || "/";
const button = (text, url, style = "primary") =>
  `<a class="button ${style}" href="${e(url)}">${text} ${arrow}</a>`;
const kicker = (text) =>
  `<p class="eyebrow"><span class="status-dot"></span>${text}</p>`;
const wave = (variant = 0) =>
  `<div class="wave-art" aria-hidden="true">${Array.from({ length: 54 }, (_, i) => `<i style="--height:${10 + Math.abs(Math.sin(i * 0.63 + variant) * Math.cos(i * 0.19)) * 85}%;--delay:${i * 18}ms"></i>`).join("")}</div>`;
const card = (d) =>
  `<article class="dataset-card"><div class="dataset-art"><span class="mono">${d.code} / AUDIO DATA</span>${wave(d.code.charCodeAt(0))}<span class="art-label">Two voices. One real conversation.</span></div><div class="dataset-content"><p class="eyebrow">${e(d.language)} · Conversational</p><h2><a href="/human-data/marketplace/${d.slug}">${e(d.name)}</a></h2><p>${e(d.description)}</p><div class="dataset-meta"><div><span class="mono">Language</span>${e(d.language)}</div><div><span class="mono">Countries</span>${e(d.countries)}</div></div><div class="card-actions">${button("Explore dataset", `/human-data/marketplace/${d.slug}`, "secondary")}<a class="text-link" href="${e(inquiryURL(`Sample request: ${d.name}`))}">Request Samples ${arrow}</a></div></div></article>`;
const productCards = () =>
  products
    .map(
      (p, i) =>
        `<a class="product-card" href="/human-data/${p.slug}"><span class="mono">0${i + 1} / ${p.eyebrow}</span><h3>${p.name}</h3><p>${p.description}</p><span class="round-arrow" aria-hidden="true">↗</span></a>`,
    )
    .join("");
function home() {
  return `<div class="wrap home"><a class="announcement" href="/converse/diarization"><span>NEW BENCHMARK</span> Meet Converse-Diarization ${arrow}</a><section class="hero-carousel" aria-roledescription="carousel" aria-label="Featured updates"><div id="hero-slide"></div><div class="carousel-bottom"><span class="mono" id="slide-number">01 / 03</span><div class="slide-dots" role="group" aria-label="Choose featured update">${["Speech-to-text benchmark", "Human expertise", "Diarization benchmark"].map((name, i) => `<button data-slide="${i}" aria-label="Slide ${i + 1}: ${name}" aria-pressed="${i === 0}"><span></span></button>`).join("")}</div><div><button class="icon-button" id="slide-prev" aria-label="Previous slide">←</button><button class="icon-button" id="slide-next" aria-label="Next slide">→</button></div></div></section><section class="intro-section"><p class="eyebrow">THE HUMAN SIDE OF ARTIFICIAL INTELLIGENCE</p><h1>Encoding human expertise<br>into <span>machines.</span></h1><div class="intro-bottom"><p>Voice, vision, reasoning, and real-world knowledge.<br>Better AI begins with the richness of human experience.</p>${button("Explore our data", "/products", "secondary")}</div></section><section class="section"><div class="section-heading"><div>${kicker("Research & Evals")}<h2>Conversation is complex.<br>Measuring it shouldn’t be.</h2></div>${button("Explore benchmarks", "/converse", "secondary")}</div><div class="research-grid">${["diarization", "stt"].map((kind) => `<a class="research-card" href="/converse/${kind}"><span class="mono">${kind === "stt" ? "Speech recognition" : "Speaker attribution"}</span><h3>Converse-${kind === "stt" ? "STT" : "Diarization"}</h3><p>${kind === "stt" ? "How accurately can AI understand what was said?" : "Can AI tell who spoke, even when voices overlap?"}</p><div class="research-stat"><strong>${data[kind].length}</strong><span>models evaluated</span><span class="round-arrow" aria-hidden="true">↗</span></div></a>`).join("")}</div></section><section class="section"><div class="section-heading"><div>${kicker("The Data Foundry")}<h2>Real people.<br>Extraordinary data.</h2></div><p>From natural conversation to specialized expertise, find the data your next model needs.</p></div><div class="product-grid">${productCards()}</div></section><section class="section"><div class="section-heading"><div>${kicker("Latest research")}<h2>From the lab.</h2></div><a class="text-link" href="/research">All research ${arrow}</a></div>${research.map(([title, date, url, type]) => `<a class="editorial-row" href="${url}"><span class="mono">${date}</span><h3>${title}</h3><span class="tag">${type}</span>${arrow}</a>`).join("")}</section></div>`;
}
function bindHome() {
  let slide = 0;
  const show = () => {
    const kind = slide === 2 ? "diarization" : "stt";
    const count = data[kind].length;
    document.querySelector("#hero-slide").innerHTML =
      slide === 1
        ? `<div class="hero-brand"><div>${kicker("Ocular AI")}<h2>Human expertise.<br>Infinite possibility.</h2><p>Data grounded in the way people speak, think, and see the world.</p><div class="button-row">${button("Get Data", "/contact")}${button("Meet our experts", "/experts", "secondary")}</div></div>${wave(2)}</div>`
        : `<div class="hero-benchmark"><div class="hero-copy">${kicker("Ocular Converse")}<h2>The Converse-${kind === "stt" ? "STT" : "Diarization"}<br>Benchmark</h2><p>${kind === "stt" ? "Real conversation. Real transcription challenges. Evaluate how accurately AI turns speech into words." : "Who said what? Evaluate how accurately AI attributes speech to each speaker in natural conversation."}</p><p class="hero-count"><strong>${count} models</strong>, one shared standard.</p><div class="button-row"><a class="button primary" href="/converse/${kind}">View Leaderboard <span class="count-badge">${count}</span></a>${button("Technical report", `https://www.useocular.com/converse/${kind}/report`, "secondary")}</div><a class="hero-dataset text-link" href="/human-data/marketplace/american-english-full-duplex">Explore the underlying dataset ${arrow}</a></div>${benchmark("hero-board", kind, data, { compact: true })}</div>`;
    const board = document.querySelector("#hero-board");
    if (board) bindBenchmark(board, data);
    document.querySelector("#slide-number").textContent = `0${slide + 1} / 03`;
    document
      .querySelectorAll("[data-slide]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(Number(b.dataset.slide) === slide),
        ),
      );
  };
  document.querySelectorAll("[data-slide]").forEach((b) =>
    b.addEventListener("click", () => {
      slide = Number(b.dataset.slide);
      show();
    }),
  );
  document.querySelector("#slide-prev").addEventListener("click", () => {
    slide = (slide + 2) % 3;
    show();
  });
  document.querySelector("#slide-next").addEventListener("click", () => {
    slide = (slide + 1) % 3;
    show();
  });
  show();
}
function marketplace() {
  return `<div class="wrap"><section class="page-heading">${kicker("The Data Marketplace")}<h1>Human conversations.<br><span>Ready for your next model.</span></h1><div class="heading-bottom"><p>Explore off-the-shelf conversational datasets.<br>Find a language, explore the details, and request a sample.</p><span class="catalogue-total mono">${datasets.length} DATASETS / ${datasets.length} LANGUAGES</span></div></section><section aria-label="Dataset catalogue"><div class="catalogue-toolbar"><label class="search-field"><span class="sr-only">Search datasets</span><span aria-hidden="true">⌕</span><input id="dataset-search" type="search" placeholder="Search datasets"></label><label class="language-select">Language<select id="language-select"><option>All</option>${datasets
    .map((d) => d.language)
    .sort()
    .map((l) => `<option>${l}</option>`)
    .join(
      "",
    )}</select></label></div><div class="language-filters" role="group" aria-label="Filter by language">${["All", ...datasets.map((d) => d.language).sort()].map((l) => `<button data-language="${l}" aria-pressed="${l === "All"}">${l}<span>${l === "All" ? datasets.length : 1}</span></button>`).join("")}</div><div class="catalogue-status"><p id="catalogue-status" role="status"></p><button id="clear-filters" class="text-button">Clear filters</button></div><div class="dataset-grid" id="dataset-grid"></div><nav id="pagination" class="pagination" aria-label="Dataset pages"></nav></section><aside class="custom-data"><div><p class="eyebrow">SOMETHING SPECIFIC IN MIND?</p><h2>Your model. Your requirements.</h2><p>Let’s talk about a dataset built around your use case.</p></div>${button("Request a custom dataset", inquiryURL("Custom dataset inquiry"), "secondary")}</aside></div>`;
}
function bindMarketplace() {
  const params = new URLSearchParams(location.search);
  let language = params.get("language") || "All",
    page = Number(params.get("page")) || 1,
    query = params.get("q") || "";
  if (!datasets.some((d) => d.language === language)) language = "All";
  const search = document.querySelector("#dataset-search");
  const select = document.querySelector("#language-select");
  search.value = query;
  select.value = language;
  const update = () => {
    const result = paginate(datasets, language, page, query);
    page = result.page;
    document.querySelector("#dataset-grid").innerHTML =
      result.items.map(card).join("") ||
      '<div class="empty-state"><h2>No datasets found</h2><p>Try another language or clear your search.</p></div>';
    document.querySelector("#catalogue-status").textContent =
      `${result.total} dataset${result.total === 1 ? "" : "s"} · Page ${page} of ${result.pages}`;
    document
      .querySelectorAll("[data-language]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.language === language)),
      );
    select.value = language;
    document.querySelector("#pagination").innerHTML = Array.from(
      { length: result.pages },
      (_, i) =>
        `<button data-page="${i + 1}" aria-label="Page ${i + 1}" ${page === i + 1 ? 'aria-current="page"' : ""}>${i + 1}</button>`,
    ).join("");
    document.querySelectorAll("[data-page]").forEach((b) =>
      b.addEventListener("click", () => {
        page = Number(b.dataset.page);
        update();
        document.querySelector(`[data-page="${page}"]`).focus();
      }),
    );
    const p = new URLSearchParams();
    if (language !== "All") p.set("language", language);
    if (query) p.set("q", query);
    if (page > 1) p.set("page", String(page));
    history.replaceState(null, "", `${path}${p.size ? "?" + p : ""}`);
  };
  document.querySelectorAll("[data-language]").forEach((b) =>
    b.addEventListener("click", () => {
      language = b.dataset.language;
      page = 1;
      update();
    }),
  );
  select.addEventListener("change", () => {
    language = select.value;
    page = 1;
    update();
  });
  search.addEventListener("input", () => {
    query = search.value;
    page = 1;
    update();
  });
  document.querySelector("#clear-filters").addEventListener("click", () => {
    language = "All";
    query = "";
    page = 1;
    search.value = "";
    update();
  });
  update();
}
function datasetPage(dataset) {
  return `<div class="wrap"><section class="page-heading"><a class="back-link" href="/human-data/marketplace">← Back to marketplace</a>${kicker(`${e(dataset.language)} / Conversational audio`)}<h1>${e(dataset.name)}</h1><p>${e(dataset.description)}</p><div class="button-row">${button("Request Samples", inquiryURL(`Sample request: ${dataset.name}`))}${button("Discuss licensing", inquiryURL(`Licensing inquiry: ${dataset.name}`), "secondary")}</div></section><div class="detail-wave">${wave(3)}<div><span class="mono">${e(dataset.language)}</span><span class="mono">FULL-DUPLEX / TWO SPEAKERS</span></div></div><section class="section detail-grid"><div><p class="eyebrow">THE DETAILS THAT MATTER</p><h2>Conversation,<br>as it happens.</h2></div><div><p>Natural dialogue includes interruptions, shared laughter, and pauses. Full-duplex recordings retain those signals so you can study more than a transcript.</p><dl><div><dt>Language</dt><dd>${e(dataset.language)}</dd></div><div><dt>Regions</dt><dd>${e(dataset.countries)}</dd></div><div><dt>Format</dt><dd>Full-duplex conversational audio</dd></div></dl><p>Request a sample to discuss recording specifications, available volume, and licensing with the Ocular team.</p></div></section></div>`;
}
function contact() {
  const subject = inquirySubject(location.search);
  const field = (
    label,
    name,
    {
      required = false,
      type = "text",
      full = false,
      placeholder = "",
      autocomplete = "",
    } = {},
  ) =>
    `<label class="field ${full ? "full" : ""}">${label}${required ? ' <span aria-hidden="true">*</span>' : ""}<input name="${name}" type="${type}" ${required ? "required" : ""} ${autocomplete ? `autocomplete="${autocomplete}"` : ""} placeholder="${placeholder}" aria-describedby="error-${name}"><span class="field-error" id="error-${name}"></span></label>`;
  const checks = (legend, name, options) =>
    `<fieldset class="full"><legend>${legend}${name === "interests" ? " *" : ""}</legend><div class="checkbox-grid">${options.map((label, i) => `<label class="check-option"><input type="checkbox" name="${name}" value="${label}" ${name === "interests" && subject.startsWith("Sample request:") && i === 1 ? "checked" : ""}><span>${label}</span></label>`).join("")}</div><p class="field-error" id="error-${name}"></p><label class="field other-field" hidden>Please specify<input name="${name === "interests" ? "otherInterest" : "otherUseCase"}" aria-describedby="error-${name === "interests" ? "otherInterest" : "otherUseCase"}"><span class="field-error" id="error-${name === "interests" ? "otherInterest" : "otherUseCase"}"></span></label></fieldset>`;
  return `<div class="wrap contact-layout"><section class="contact-intro">${kicker("Let’s build what’s next")}<h1>Great data.<br>Starts here.</h1><p>Tell us what you’re working on.<br>Let’s find the right data for your next breakthrough.</p><div class="contact-links"><span class="mono">SALES INQUIRIES</span><a href="mailto:sales@useocular.com">sales@useocular.com ${arrow}</a><span class="mono">RESEARCH & BENCHMARKS</span><a href="mailto:research@useocular.com">research@useocular.com ${arrow}</a></div><aside class="expert-note"><p>Looking for expert opportunities?</p><span>Explore contract roles on our experts platform.</span><a class="text-link" href="https://workbolt.ai/public-jobs">Go to Workbolt ${arrow}</a></aside></section><section class="contact-form-section" aria-label="Contact Ocular"><div class="form-heading"><h2>Tell us about your project</h2><p>Fields marked * are required.</p></div><p class="preview-note">Local preview: this form runs a test submission. No sales request is sent.</p><form id="contact-form" class="form-grid" novalidate><label class="field full context-field">Request subject<input name="subject" value="${e(subject)}" maxlength="1000" placeholder="What would you like to discuss?"><span class="field-hint">Your selected dataset or product is included here. You can edit it.</span></label>${field("First name", "firstName", { required: true, autocomplete: "given-name" })}${field("Last name", "lastName", { required: true, autocomplete: "family-name" })}${field("Work email", "email", { required: true, type: "email", autocomplete: "email" })}${field("Phone number", "phone", { type: "tel", autocomplete: "tel" })}${field("Job title", "jobTitle", { required: true, autocomplete: "organization-title" })}${field("Company name", "company", { required: true, autocomplete: "organization" })}${field("Company website", "companyWebsite", { placeholder: "acme.com" })}<label class="field">Company type <span aria-hidden="true">*</span><select name="companyType" required aria-describedby="error-companyType"><option value="">Select company type</option><option>Startup</option><option>Enterprise</option><option>Research lab</option><option>University</option><option>Other</option></select><span class="field-error" id="error-companyType"></span></label>${checks("What are you interested in?", "interests", interests)}${field("Expected data volume", "dataVolume", { full: true, placeholder: "e.g. 500 hours of audio" })}${checks("How do you plan to use the data?", "useCases", useCases)}<label class="field full">Tell us more about your project or data needs<textarea name="message" rows="5"></textarea></label><div class="full form-submit"><button type="submit" class="button primary">Test inquiry ${arrow}</button><span class="form-status" id="form-status" role="status"></span></div></form></section></div>`;
}
function bindContact() {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  form
    .querySelectorAll('input[type="checkbox"][value="Other"]')
    .forEach((box) =>
      box.addEventListener("change", () => {
        box.closest("fieldset").querySelector(".other-field").hidden =
          !box.checked;
      }),
    );
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    form
      .querySelectorAll(".field-error")
      .forEach((el) => (el.textContent = ""));
    form
      .querySelectorAll("[aria-invalid]")
      .forEach((el) => el.removeAttribute("aria-invalid"));
    const payload = contactPayload(new FormData(form));
    const errors = validateContact(payload);
    if (Object.keys(errors).length) {
      for (const [key, message] of Object.entries(errors)) {
        form.querySelector(`#error-${key}`).textContent = message;
        form
          .querySelector(`[name="${key}"]`)
          ?.setAttribute("aria-invalid", "true");
      }
      status.textContent = "Please check the highlighted fields.";
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    status.textContent = "Testing your inquiry…";
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Submission failed");
      const result = await response.json();
      if (result.mode !== "mock") throw new Error("Unexpected response");
      status.textContent =
        "Test successful. Your request context was included. Nothing was sent to sales.";
    } catch {
      status.textContent =
        "The test could not complete. Your entries are preserved; please try again.";
    } finally {
      submit.disabled = false;
    }
  });
}
function benchmarkPage(kind) {
  const count = data[kind].length;
  return `<div class="wrap"><section class="page-heading benchmark-heading"><a class="back-link" href="/converse">← Ocular Converse</a>${kicker("Research / Voice AI")}<h1>Converse-${kind === "stt" ? "STT" : "Diarization"}<br><span>Benchmark</span></h1><p>${kind === "stt" ? "Measure how accurately models transcribe natural, two-person conversations." : "Measure how accurately models attribute speech to the right person in natural, two-speaker conversations."}</p><div class="button-row">${button("Work with us", inquiryURL(`Converse-${kind === "stt" ? "STT" : "Diarization"} benchmark inquiry`))}${button("Technical report", `https://www.useocular.com/converse/${kind}/report`, "secondary")}</div></section><div class="benchmark-stats"><div><strong data-model-count>${count}</strong><span class="mono">Models evaluated</span></div><div><strong>${Math.min(...data[kind].map((m) => Object.values(m.scores)[0])).toFixed(2)}%</strong><span class="mono">Lowest ${kind === "stt" ? "WER" : "DER"}</span></div><div><strong>2</strong><span class="mono">Speakers per conversation</span></div></div>${benchmark("main-board", kind, data)}<section class="section detail-grid"><div>${kicker("Behind the benchmark")}<h2>Measured against<br>real conversation.</h2></div><div><p>These results compare systems on the same conversational recordings. Choose a metric to inspect scores, or filter by model access to compare a smaller group.</p><details><summary>How should I read these scores?</summary><p>Error metrics measure mistakes as a percentage; lower scores are better. Speaker Count measures correct speaker identification, so higher is better.</p></details><details><summary>Where can I find the methodology?</summary><p>Read the <a href="https://www.useocular.com/converse/${kind}/report">original technical report</a> for dataset, normalization, and evaluation details. This local reconstruction uses the October 18, 2026 public score snapshot.</p></details></div></section></div>`;
}
function researchPage() {
  return `<div class="wrap"><section class="page-heading">${kicker("Ocular Research")}<h1>How well does AI<br><span>understand us?</span></h1><p>Explore benchmarks built around the complexity of real conversation.</p></section><div class="research-grid">${["diarization", "stt"].map((kind) => `<a class="research-card" href="/converse/${kind}"><span class="mono">${data[kind].length} MODELS</span><h2>Converse-${kind === "stt" ? "STT" : "Diarization"}</h2><p>${kind === "stt" ? "From spoken conversation to accurate text." : "From overlapping voices to the right speaker."}</p><span class="text-link">Explore leaderboard ${arrow}</span></a>`).join("")}</div><section class="section">${research.map(([title, date, url, type]) => `<a class="editorial-row" href="${url}"><span class="mono">${date}</span><h3>${title}</h3><span class="tag">${type}</span>${arrow}</a>`).join("")}</section></div>`;
}
function productPage(product) {
  return `<div class="wrap"><section class="page-heading">${kicker(product.eyebrow)}<h1>${product.name}</h1><p>${product.description}</p><div class="button-row">${button("Talk to sales", inquiryURL(product.subject || `${product.name} inquiry`))}${button("Browse datasets", "/human-data/marketplace", "secondary")}</div></section><div class="detail-wave">${wave(5)}</div><section class="section detail-grid"><h2>Make your next model<br>more human.</h2><div><p>Start with your use case. Discuss the languages, recording formats, and evaluation goals that matter to your team.</p><a class="text-link" href="${e(inquiryURL(product.subject || `${product.name} inquiry`))}">Discuss your requirements ${arrow}</a></div></section></div>`;
}
function careers() {
  return `<div class="wrap"><section class="page-heading">${kicker("Build with us")}<h1>Careers</h1><p>Help build the next generation of human-centered AI.</p></section><section class="detail-grid section"><h2>Curiosity. Craft.<br>Real-world impact.</h2><div><p>Ocular brings together researchers, engineers, and domain experts to turn human knowledge into better AI.</p><p>Explore current openings on the official careers page for role details and application instructions.</p>${button("View current openings", "https://www.useocular.com/careers")}</div></section><section class="values-grid">${[
    [
      "Customer-driven",
      "Understand the problem deeply. Build something useful.",
    ],
    [
      "Humble and collaborative",
      "Share ideas openly. Learn from the people around you.",
    ],
    ["Ownership", "Take responsibility for the details and the outcome."],
    ["Move with purpose", "Turn thoughtful decisions into working solutions."],
  ]
    .map(([h, p]) => `<article><h3>${h}</h3><p>${p}</p></article>`)
    .join("")}</section></div>`;
}
function blog() {
  const posts = [
    [
      "$2M pre-seed funding",
      "Company",
      "Oct 5, 2026",
      "https://www.useocular.com/blog",
    ],
    [
      "Full-duplex audiovisual datasets",
      "Product",
      "Sep 28, 2026",
      "/human-data/audiovisual",
    ],
    [
      "The Converse-Diarization Benchmark",
      "Research",
      "Oct 13, 2026",
      "/converse/diarization",
    ],
  ];
  return `<div class="wrap"><section class="page-heading">${kicker("Ideas, updates & research")}<h1>From the Ocular team.</h1></section><div class="product-grid">${posts.map(([title, category, date, url], i) => `<a class="product-card" href="${url}"><span class="mono">${category} / ${date}</span>${wave(i)}<h2>${title}</h2><span class="text-link">Read more ${arrow}</span></a>`).join("")}</div></div>`;
}
let content, title, bind;
if (path === "/") {
  content = home();
  title = "Human expertise. Machine intelligence.";
  bind = bindHome;
} else if (path === "/human-data/marketplace") {
  content = marketplace();
  title = "Data Marketplace";
  bind = bindMarketplace;
} else if (path.startsWith("/human-data/marketplace/")) {
  const d = datasets.find((d) => path.endsWith("/" + d.slug));
  if (d) {
    content = datasetPage(d);
    title = d.name;
  }
} else if (path === "/contact") {
  content = contact();
  title = "Contact";
  bind = bindContact;
} else if (["/converse/diarization", "/converse/stt"].includes(path)) {
  const kind = path.split("/").pop();
  content = benchmarkPage(kind);
  title = `Converse-${kind === "stt" ? "STT" : "Diarization"}`;
  bind = () => bindBenchmark(document.querySelector("#main-board"), data);
} else if (["/research", "/converse"].includes(path)) {
  content = researchPage();
  title = "Research & Benchmarks";
} else if (path === "/products") {
  content = `<div class="wrap"><section class="page-heading">${kicker("The Ocular Data Foundry")}<h1>Data for the next<br><span>generation of AI.</span></h1><p>Explore conversational datasets and specialized data for your next model.</p>${button("Explore the marketplace", "/human-data/marketplace")}</section><div class="product-grid">${productCards()}</div></div>`;
  title = "Products";
} else if (products.some((p) => path === `/human-data/${p.slug}`)) {
  const p = products.find((p) => path === `/human-data/${p.slug}`);
  content = productPage(p);
  title = p.name;
} else if (path === "/careers") {
  content = careers();
  title = "Careers";
} else if (path === "/blog") {
  content = blog();
  title = "Blog";
} else if (path === "/enterprise") {
  content = productPage({
    name: "Enterprise data. Human expertise.",
    eyebrow: "Built around your ambitions",
    description:
      "Discuss custom data, evaluation, and licensing requirements with the Ocular team.",
    subject: "Enterprise data inquiry",
  });
  title = "Enterprise";
} else if (["/company", "/experts"].includes(path)) {
  content = `<div class="wrap"><section class="page-heading">${kicker("The people behind the intelligence")}<h1>Expertise makes<br><span>all the difference.</span></h1><p>Ocular connects human knowledge with the models learning from it. Explore the expert network or talk to us about your data needs.</p><div class="button-row">${button("Work with Ocular", "/contact")}${button("Explore expert roles", "https://workbolt.ai/public-jobs", "secondary")}</div></section><div class="detail-wave">${wave(2)}</div></div>`;
  title = "Human Expertise";
}
if (!content) {
  title = "Page not found";
  content = `<section class="wrap page-heading"><p class="eyebrow">404</p><h1>This page isn’t here.</h1><p>Explore our datasets or head back to the homepage.</p>${button("Back to home", "/")}</section>`;
}
document.title = `${title} | Ocular AI`;
document.querySelector("#app").innerHTML =
  `${header()}<main id="main" tabindex="-1">${content}</main>${footer()}`;
bindNavigation();
bind?.();
