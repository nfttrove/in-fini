import { describe, it, expect, vi, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { ThemeProvider } from "./contexts/ThemeContext";
import ClaimRegistryPanel from "./components/ClaimRegistryPanel";
import NetworkPanel from "./components/NetworkPanel";
import networkPanelSrc from "./components/NetworkPanel.tsx?raw";
import type { ComponentType } from "react";
import appSrc from "./App.tsx?raw";
import { ERRATA } from "./data/errata";

/**
 * The site's Supabase project was shut down in September 2026. These fail if
 * the page starts calling it again or invites visitors to file into it.
 */
const html = (el: JSX.Element) =>
  renderToString(<ThemeProvider>{el}</ThemeProvider>)
    .replace(/<!-- -->/g, "")
    .replace(/&#x27;/g, "'");

// Everything that ships, with JSX line wrapping collapsed.
const SOURCE = (
  Object.values(
    import.meta.glob(["./components/**/*.tsx", "./App.tsx", "./data/*.ts"], {
      query: "?raw",
      import: "default",
      eager: true,
    })
  ).join("\n") as string
).replace(/\s+/g, " ");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("the database is offline", () => {
  it("keeps the client off even when the host still sets the Supabase env", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-key");
    vi.resetModules();
    const lib = await import("./lib/supabase");
    expect(lib.supabase).toBeNull();
    expect(lib.supabaseConfigured).toBe(false);
    await expect(lib.listClaims()).rejects.toThrow("offline");
  });

  it("the Claim Registry says so and offers nothing to file", () => {
    const page = html(<ClaimRegistryPanel />);
    expect(page).toContain("The public registry is offline");
    expect(page).toContain("The budget's verdict");
    for (const gone of ["File this claim", "Pre-register this prediction", "Claim title", "The public record", "all filed with the claim"]) {
      expect(page).not.toContain(gone);
    }
  });

  it("the Replication Network says so and still profiles your rig", () => {
    const page = html(<NetworkPanel />);
    expect(page).toContain("The census is offline");
    expect(page).toContain("Record 60 seconds");
    for (const gone of ["File into the census", "Rig label", "The fleet", "give your rig a label, file it"]) {
      expect(page).not.toContain(gone);
    }
    // The file button only renders once a run is recorded, so check its guard.
    expect(networkPanelSrc).toMatch(/\{supabaseConfigured && \(\s*<button\s+onClick=\{file\}/);
  });

  it("no tab invites visitors to file, submit, save, pre-register or join", () => {
    // Broad on purpose: any filing/joining vocabulary fails unless the whole
    // sentence is one of these, each an offline note or general lab advice.
    // Covers each tab's first render (text plus placeholder, title and
    // aria-label), the tab descriptions, the Errata intro and every
    // erratum's "now"; only the "was" history is skipped.
    const ALLOWED = new Set([
      "The public registry is offline, so claims can no longer be filed or pre-registered.",
      "The census is offline, so runs can no longer be filed or compared with other rigs.",
      "Calibration Census 001.", // the Replication Network heading
      "Calibration Census 001:", // its tab description
      "Census values are labelled milli-g;", // an erratum's "now"
      "nothing is uploaded.",
      "sensor calibration traceable to a standard, a pre-registered analysis plan, A/B null tests with the effect source off, and someone trying their hardest to prove you wrong.",
      "pre-register the setup and budget before powering on",
      "Which contributes more:",
      "and a jewelry scale can register it, once it survives the null tests.", // a scale registering a force
    ]);
    const VOCAB = /\b(fil(e|es|ed|ing)|submit\w*|sav(e|es|ed|ing)|join\w*|contribut\w*|pre-?regist\w*|census|fleet|upload\w*|shared|sharing|public record|filings|log (this )?run|(share|publish|register|send|post|add) (it|this|yours?|the result)\b)\b/i;
    const decode = (x: string) =>
      x.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    // Inline tags sit inside a sentence; every other tag ends one.
    const INLINE = /<\/?(?:strong|em|b|i|a|span|code|sub|sup|br)\b[^>]*>/g;
    const texts: [string, string][] = [];
    const panels = import.meta.glob<{ default: ComponentType }>("./components/*Panel.tsx", { eager: true });
    expect(Object.keys(panels).length).toBeGreaterThanOrEqual(20);
    for (const [path, mod] of Object.entries(panels)) {
      const page = html(<mod.default />);
      const attrs = [...page.matchAll(/\s(?:placeholder|title|aria-label)="([^"]*)"/g)].map((m) => decode(m[1]));
      let text = decode(page.replace(INLINE, " ").replace(/<[^>]+>/g, " . ")) + " . " + attrs.join(" . ");
      if (path.endsWith("/ErrataPanel.tsx")) {
        // Longest first, so a short tab name can't break a longer entry's match.
        const history = ERRATA.flatMap((e) => [e.title, e.was, e.tab]).sort((x, y) => y.length - x.length);
        for (const v of history) text = text.split(v).join(" . ");
      }
      texts.push([path, text.replace(/\s+/g, " ")]);
    }
    for (const m of appSrc.matchAll(/description:\s*"([^"]+)"/g)) texts.push(["App.tsx tab description", m[1]]);
    expect(texts.length).toBeGreaterThanOrEqual(40);
    const hits: string[] = [];
    for (const [where, text] of texts) {
      for (const raw of text.split(/(?<=[.!?:;—])\s+|\s*·\s*/)) {
        const sentence = raw.replace(/\s+([.;:])/g, "$1").trim();
        if (VOCAB.test(sentence) && !ALLOWED.has(sentence)) hits.push(`${where}: ${sentence}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("retired phrases stay out of the source, and no copy claims the database was fixed", () => {
    for (const phrase of [
      "file it in the Claim Registry",
      "File it in the Claim Registry",
      "A public record",
      "join the fleet",
      "Your noise floor joins the census",
      "and so will everyone else",
      "a public, reproducible record",
      "add its noise floor to a census",
      "The database stamps",
      "database migration rescales",
      "works for the cloud presets",
      "(see the Claim Registry)",
      "File your measured force in the Claim Registry",
      "same fleet",
      "Once the census is populated",
      "Claimed 1.3 W rotor device",
      "N counts filed runs",
    ]) {
      expect(SOURCE, phrase).not.toContain(phrase);
    }
  });
});
