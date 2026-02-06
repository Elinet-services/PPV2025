import fs from "fs";
import path from "path";

const SOURCE_DIR = path.join(process.cwd(), "src");
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const MAILTO_REGEX = /<a\s+[^>]*href="mailto:([^"?]+)[^"]*"[^>]*>\s*([^<\s][^<]*)\s*<\/a>/g;

function collectSourceFiles(directory) {
  const files = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

test("all mailto links use same visible text as email", () => {
  const files = collectSourceFiles(SOURCE_DIR);
  const mismatches = [];
  let inspectedLinks = 0;

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8");
    for (const match of source.matchAll(MAILTO_REGEX)) {
      inspectedLinks += 1;
      const hrefAddress = match[1].trim();
      const visibleText = match[2].trim();

      if (hrefAddress !== visibleText) {
        mismatches.push({
          file: path.relative(process.cwd(), filePath),
          hrefAddress,
          visibleText,
        });
      }
    }
  }

  expect(inspectedLinks).toBeGreaterThan(0);
  expect(mismatches).toEqual([]);
});
