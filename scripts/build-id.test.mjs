import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { computeBuildId, listBuildInputs } from "./build-id.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "buildid-"));
  mkdirSync(join(root, "src", "utils"), { recursive: true });
  mkdirSync(join(root, "public"));
  writeFileSync(join(root, "index.html"), "<html></html>");
  writeFileSync(join(root, "package.json"), "{}");
  writeFileSync(join(root, "src", "App.tsx"), "export default 1;");
  writeFileSync(join(root, "src", "utils", "physics.ts"), "export const c = 3e8;");
  writeFileSync(join(root, "src", "utils", "physics.test.ts"), "test");
  writeFileSync(join(root, "public", "logo.svg"), "<svg/>");
  return root;
}

describe("build ID", () => {
  it("is deterministic and ignores test files", () => {
    const root = fixture();
    const id = computeBuildId(root);
    expect(id).toMatch(/^[0-9a-f]{12}$/);
    expect(computeBuildId(root)).toBe(id);
    expect(listBuildInputs(root)).not.toContain("src/utils/physics.test.ts");
    writeFileSync(join(root, "src", "utils", "physics.test.ts"), "a different test");
    expect(computeBuildId(root)).toBe(id);
  });

  it("changes when anything that ships changes", () => {
    const root = fixture();
    const id = computeBuildId(root);
    writeFileSync(join(root, "src", "utils", "physics.ts"), "export const c = 2.998e8;");
    const id2 = computeBuildId(root);
    expect(id2).not.toBe(id);
    writeFileSync(join(root, "public", "logo.svg"), "<svg></svg>");
    expect(computeBuildId(root)).not.toBe(id2);
  });

  it("ignores CRLF line endings and dotfiles, so no environment raises a false alarm", () => {
    const root = fixture();
    const id = computeBuildId(root);
    writeFileSync(join(root, "src", "App.tsx"), "export default 1;".replace(/;/, ";\r\n"));
    const lf = fixture();
    writeFileSync(join(lf, "src", "App.tsx"), "export default 1;\n");
    expect(computeBuildId(root)).toBe(computeBuildId(lf));
    writeFileSync(join(lf, "public", ".DS_Store"), "junk");
    expect(computeBuildId(lf)).toBe(computeBuildId(root));
    expect(id).not.toBe(computeBuildId(lf));
  });
});
