/**
 * Downloads the role icons only if they haven't been downloaded yet.
 *
 * The icons are large external git repositories (botc-icons / botc-release)
 * that get cloned and copied into `src/assets/icons`. Previously the `serve`
 * and `build` scripts re-downloaded them on every run, which was slow and
 * required a network connection each time. This script makes the download
 * conditional: if the target icon folders already exist (and are non-empty),
 * the download is skipped.
 *
 * To force a fresh download, delete `src/assets/icons` (or the relevant
 * sub-folder), or run the underlying npm scripts directly, e.g.
 *   npm run clone-official && npm run copy-official
 */
const { existsSync, readdirSync } = require("fs");
const { execSync } = require("child_process");

const hasIcons = (dir) => existsSync(dir) && readdirSync(dir).length > 0;

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const sets = [
  {
    name: "unofficial",
    dir: "./src/assets/icons/unofficial",
    clone: "clone-unofficial",
    copy: "copy-unofficial"
  },
  {
    name: "official",
    dir: "./src/assets/icons/official",
    clone: "clone-official",
    copy: "copy-official"
  }
];

for (const set of sets) {
  if (hasIcons(set.dir)) {
    console.log(`✓ ${set.name} icons already present, skipping download.`);
    continue;
  }
  console.log(`↓ Downloading ${set.name} icons...`);
  run(`npm run ${set.clone}`);
  run(`npm run ${set.copy}`);
}
