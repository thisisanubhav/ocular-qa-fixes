import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
test("local API validates and echoes a mock inquiry without delivery", async () => {
  const child = spawn(process.execPath, ["scripts/server.mjs"], {
    env: { ...process.env, PORT: "3219" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await once(child.stdout, "data");
    const base = "http://127.0.0.1:3219";
    const payload = {
      firstName: "QA",
      lastName: "Tester",
      email: "qa@example.test",
      jobTitle: "Researcher",
      company: "Local QA",
      companyType: "Startup",
      subject: "Sample request: Hindi Full-Duplex Conversational Dataset",
      interests: ["Browse our Off-the-shelf Datasets"],
      useCases: ["Pre-training"],
    };
    const response = await fetch(base + "/api/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.mode, "mock");
    assert.deepEqual(result.received, payload);
    assert.equal((await fetch(base + "/api/contact")).status, 405);
    assert.equal(
      (await fetch(base + "/api/contact", { method: "POST", body: "bad json" }))
        .status,
      400,
    );
    assert.equal(
      (
        await fetch(base + "/api/contact", {
          method: "POST",
          body: JSON.stringify({ ...payload, email: "bad" }),
        })
      ).status,
      422,
    );
    assert.equal((await fetch(base + "/contact?subject=Hi-Fi")).status, 200);
    assert.equal((await fetch(base + "/.git/config")).status, 404);
  } finally {
    child.kill();
  }
});
