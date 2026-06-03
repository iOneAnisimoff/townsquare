/**
 * Merges Russian role translations from data_parse/new_roles.json into
 * src/roles.json, overwriting the `name` and `ability` fields for every
 * role whose `id` matches. Other fields (reminders, flavor, night order,
 * etc.) are left untouched.
 *
 * Run with: node scripts/merge-translations.js
 */
const { readFileSync, writeFileSync } = require("fs");

const rolesPath = "./src/roles.json";
const translationsPath = "./data_parse/new_roles.json";

const roles = JSON.parse(readFileSync(rolesPath, "utf8"));
const translations = JSON.parse(readFileSync(translationsPath, "utf8"));

const trById = new Map(translations.map((t) => [t.id, t]));

let translated = 0;
const untranslated = [];

for (const role of roles) {
  const tr = trById.get(role.id);
  if (tr) {
    if (tr.name) role.name = tr.name;
    if (tr.ability) role.ability = tr.ability;
    translated++;
  } else {
    untranslated.push(role.id);
  }
}

writeFileSync(rolesPath, JSON.stringify(roles, null, 2) + "\n", "utf8");

console.log(`Translated ${translated}/${roles.length} roles.`);
if (untranslated.length) {
  console.log(`No translation for ${untranslated.length} ids:`);
  console.log("  " + untranslated.join(", "));
}
