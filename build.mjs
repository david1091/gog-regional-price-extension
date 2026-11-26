// Genera los paquetes de la extensión para cada navegador, sin dependencias.
//   node build.mjs            -> dist/firefox y dist/chromium
//   node build.mjs chromium   -> solo dist/chromium
// Si el comando `zip` está disponible, crea también dist/<navegador>.zip.
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const shared = ["background.js", "content.js", "content.css", "countries.js",
                "options.html", "options.js", "_locales", "icons"];

const targets = {
  firefox: { files: ["manifest.json"], from: root },
  chromium: { files: ["manifest.json", "service-worker.js"], from: join(root, "platform", "chromium") }
};

const wanted = process.argv.slice(2);
for (const name of wanted.length ? wanted : Object.keys(targets)) {
  const t = targets[name];
  if (!t) { console.error(`Destino desconocido: ${name} (usa: ${Object.keys(targets).join(", ")})`); process.exit(1); }
  const out = join(root, "dist", name);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const f of shared) cpSync(join(root, f), join(out, f), { recursive: true });
  for (const f of t.files) cpSync(join(t.from, f), join(out, f));
  let msg = `✔ dist/${name}`;
  try {
    const zip = join(root, "dist", `${name}.zip`);
    rmSync(zip, { force: true });
    execFileSync("zip", ["-qr", zip, "."], { cwd: out, stdio: "ignore" });
    msg += ` + dist/${name}.zip`;
  } catch { /* sin `zip`: solo la carpeta */ }
  console.log(msg);
}
