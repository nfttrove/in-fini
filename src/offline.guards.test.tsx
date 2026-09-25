import { describe, it, expect, vi, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { ThemeProvider } from "./contexts/ThemeContext";
import ClaimRegistryPanel from "./components/ClaimRegistryPanel";
import NetworkPanel from "./components/NetworkPanel";
import networkPanelSrc from "./components/NetworkPanel.tsx?raw";

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

  it("no copy invites visitors to file, save or join, or claims the database was fixed", () => {
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
    ]) {
      expect(SOURCE, phrase).not.toContain(phrase);
    }
  });
});
