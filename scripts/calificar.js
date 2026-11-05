// Adaptador Java (los tests usan node:test y compilan cada ejercicio con javac).
// Corre los tests de cada ejercicio y calcula la nota (0.0 a 5.0).
// La lista de ejercicios sale de .github/calificacion.json
// Uso local:   npm test          → todos los ejercicios
//              npm test -- 03    → solo el ejercicio 03
// En GitHub Actions además genera resultado.json y el resumen del run.

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const RAIZ = path.join(__dirname, "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(RAIZ, ".github", "calificacion.json"), "utf8"));
const TIEMPO_MAXIMO_MS = 120000;
const TIEMPO_POR_TEST_MS = 45000;
const MAX_FALLOS_EN_CONSOLA = 2;
const EN_GITHUB = process.env.GITHUB_ACTIONS === "true";

function javaInstalado() {
  const extension = process.platform === "win32" ? ".exe" : "";
  let javac = "javac";
  if (process.env.JAVA_HOME) {
    const ruta = path.join(process.env.JAVA_HOME, "bin", "javac" + extension);
    if (fs.existsSync(ruta)) javac = ruta;
  }
  const proceso = spawnSync(javac, ["-version"], { encoding: "utf8" });
  return !proceso.error;
}

function nombresDeTests(rutaTest) {
  const codigo = fs.readFileSync(rutaTest, "utf8");
  return [...codigo.matchAll(/^test\((["'])(.+?)\1,/gm)].map((m) => m[2]);
}

function primeraLineaDeError(lineas, desde) {
  for (let i = desde + 1; i < lineas.length && !/^(ok|not ok) \d+/.test(lineas[i]); i++) {
    const enLinea = lineas[i].match(/^\s+error: (['"])(.*)\1$/);
    if (enLinea) return enLinea[2].replace(/\\"/g, '"').replace(/''/g, "'");
    if (/^\s+error: \|-?$/.test(lineas[i])) return (lineas[i + 1] || "").trim();
  }
  return "";
}

function ejecutar(rutaTest, extra, tiempoMaximo) {
  const proceso = spawnSync(process.execPath, ["--test-reporter=tap", ...extra, rutaTest], {
    cwd: RAIZ,
    encoding: "utf8",
    timeout: tiempoMaximo,
  });
  const lineas = (proceso.stdout || "").split(/\r?\n/);
  const fallidos = [];
  let pasados = 0;

  lineas.forEach((linea, i) => {
    if (/^ok \d+ - /.test(linea)) pasados++;
    const fallo = linea.match(/^not ok \d+ - (.*)$/);
    if (fallo) fallidos.push({ nombre: fallo[1], mensaje: primeraLineaDeError(lineas, i) });
  });

  return {
    pasados,
    fallidos,
    agotado: Boolean(proceso.error && proceso.error.code === "ETIMEDOUT"),
  };
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Si un archivo de tests se queda sin tiempo, se corre cada test por separado
// para no perder la nota de los que sí pasan.
function ejecutarUnoPorUno(rutaTest, nombres) {
  const resultado = { pasados: 0, fallidos: [] };
  for (const nombre of nombres) {
    const r = ejecutar(rutaTest, [`--test-name-pattern=^${escaparRegex(nombre)}$`], TIEMPO_POR_TEST_MS);
    if (r.agotado) {
      resultado.fallidos.push({ nombre, mensaje: "Tiempo agotado: posible ciclo infinito" });
    } else {
      resultado.pasados += Math.min(r.pasados, 1);
      resultado.fallidos.push(...r.fallidos);
    }
  }
  return resultado;
}

function correrEjercicio(ejercicio) {
  const rutaTest = path.join(RAIZ, ejercicio.test);
  const nombres = nombresDeTests(rutaTest);
  const total = nombres.length;
  let r = ejecutar(rutaTest, [], TIEMPO_MAXIMO_MS);

  let aviso = "";
  if (r.agotado) {
    aviso = "Tiempo agotado: revisa si tienes un ciclo infinito.";
    r = ejecutarUnoPorUno(rutaTest, nombres);
  }

  return {
    id: ejercicio.id,
    titulo: ejercicio.titulo,
    pasados: Math.min(r.pasados, total),
    total,
    fallidos: r.fallidos,
    aviso,
  };
}

function calcularNota(resultados) {
  const pasados = resultados.reduce((suma, r) => suma + r.pasados, 0);
  const total = resultados.reduce((suma, r) => suma + r.total, 0);
  const nota = total === 0 ? 0 : Math.round((pasados / total) * 50) / 10;
  return { pasados, total, nota };
}

function icono(r) {
  if (r.pasados === r.total) return "✅";
  return r.pasados > 0 ? "🟡" : "❌";
}

function imprimirEnConsola(resultados, resumen) {
  console.log(`\n${CONFIG.curso} · Resultados de tus ejercicios\n`);
  for (const r of resultados) {
    console.log(`${icono(r)} ${r.id} ${r.titulo.padEnd(26)} ${r.pasados}/${r.total} tests`);
    if (r.aviso) console.log(`     ⚠️  ${r.aviso}`);
    for (const f of r.fallidos.slice(0, MAX_FALLOS_EN_CONSOLA)) {
      console.log(`     ✗ ${f.nombre}`);
      if (f.mensaje) console.log(`       → ${f.mensaje}`);
    }
    const ocultos = r.fallidos.length - MAX_FALLOS_EN_CONSOLA;
    if (ocultos > 0) console.log(`     … y ${ocultos} test(s) más por corregir`);
  }
  console.log(`\n📊 Tests aprobados: ${resumen.pasados}/${resumen.total}`);
  console.log(`🎯 Nota: ${resumen.nota.toFixed(1)} / 5.0\n`);
}

function escribirResumenGithub(resultados, resumen) {
  const filas = resultados.map(
    (r) => `| ${icono(r)} | ${r.id} · ${r.titulo} | ${r.pasados}/${r.total} |`
  );
  const detalles = resultados
    .filter((r) => r.fallidos.length || r.aviso)
    .map((r) => {
      const items = r.fallidos.map((f) => `- ✗ ${f.nombre}${f.mensaje ? ` → ${f.mensaje}` : ""}`);
      if (r.aviso) items.unshift(`- ⚠️ ${r.aviso}`);
      return `**${r.id} · ${r.titulo}**\n${items.join("\n")}`;
    });

  const markdown = [
    `## 🎯 Nota: ${resumen.nota.toFixed(1)} / 5.0`,
    `Tests aprobados: **${resumen.pasados}/${resumen.total}**`,
    "",
    "| Estado | Ejercicio | Tests |",
    "|---|---|---|",
    ...filas,
    "",
    detalles.length ? "### Qué falta por corregir\n\n" + detalles.join("\n\n") : "### ¡Todo perfecto! 🎉",
  ].join("\n");

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + "\n");
  }
  const paraArtefacto = resultados.map(({ id, pasados, total }) => ({ id, pasados, total }));
  fs.writeFileSync(path.join(RAIZ, "resultado.json"), JSON.stringify({ ejercicios: paraArtefacto }));
}

if (!javaInstalado() && !EN_GITHUB) {
  console.log("\n❌ No encuentro Java (javac) en tu computador.");
  console.log("   Revisa la sección «Errores frecuentes» del README: «No encuentro Java (javac)».\n");
  process.exit(1);
}

const filtro = process.argv[2];
const ejercicios = CONFIG.ejercicios.filter((e) => !filtro || e.id === filtro.padStart(2, "0"));

if (ejercicios.length === 0) {
  const ids = CONFIG.ejercicios.map((e) => e.id).join(", ");
  console.log(`No encontré el ejercicio "${filtro}". Los disponibles son: ${ids}`);
  process.exit(1);
}

const resultados = ejercicios.map(correrEjercicio);
const resumen = calcularNota(resultados);

imprimirEnConsola(resultados, resumen);
if (EN_GITHUB) escribirResumenGithub(resultados, resumen);

process.exitCode = resumen.pasados === resumen.total ? 0 : 1;
