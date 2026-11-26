// Household budget site entry (Node 22, standard library only).
//
// The site is the static files in app/ beside this file, plus the screenshots
// in screenshots/. This program hands them in: it copies both folders into
// the output directory and writes dossier.json there, the summary the judge
// reads, using the vendored make.fun library. The library file itself is the
// kit's copy and is left exactly as it came.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The run is deterministic: it writes the same bytes every time, so the
// grader's two runs agree.

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// Fail early with a plain message when the site is not where it should be,
// instead of half-copying and writing a dossier for a broken entry.
if (!existsSync(join(repoRoot, 'app', 'index.html'))) {
  throw new Error('budgetsite: app/index.html is missing — nothing to hand in');
}
if (!existsSync(join(repoRoot, 'screenshots'))) {
  throw new Error('budgetsite: screenshots/ is missing — the entry needs 3 or 4 screenshots');
}

// Copy one directory tree, files only, preserving names. Nothing is skipped
// and nothing is renamed, so the output holds exactly what the repo holds.
function copyTree(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  let files = 0;
  for (const name of readdirSync(sourceDir).sort()) {
    const from = join(sourceDir, name);
    const to = join(targetDir, name);
    if (statSync(from).isDirectory()) {
      files += copyTree(from, to);
    } else {
      copyFileSync(from, to);
      files += 1;
    }
  }
  return files;
}

const appFiles = copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));
const shotFiles = copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

// The scorer's caps for this competition: the dossier text is capped at
// 160 KiB, at most 4 screenshots of at most 256 KiB each, app/ at most
// 993 entries and 16 MiB. buildDossier refuses anything past them.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

// The scorer refuses a dossier over 1.5 MiB; say so now rather than at grade time.
if (dossier.length > 1572864) {
  throw new Error(`budgetsite: dossier.json is ${dossier.length} bytes, over the 1.5 MiB cap`);
}

console.log(`budgetsite: ${appFiles} app files, ${shotFiles} screenshots, dossier ${dossier.length} bytes -> ${outputDir}`);
