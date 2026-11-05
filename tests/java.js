// Ayuda para los tests: compila tus clases de Java junto con la sonda (tests/java/Sonda.java),
// ejecuta los chequeos de un ejercicio y entrega el resultado de cada uno.
// Un error en un ejercicio NO afecta a los demás (salvo al integrador, que usa otras clases).

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

const CARPETA = path.join(__dirname, "..", "ejercicios");
const SONDA = path.join(__dirname, "java", "Sonda.java");
const CACHE = path.join(os.tmpdir(), "cordillera-java");
const TIEMPO_EJECUCION_MS = 10000;

function entorno() {
  const env = { ...process.env };
  delete env.JAVA_TOOL_OPTIONS;
  delete env._JAVA_OPTIONS;
  return env;
}

function binario(nombre) {
  const extension = process.platform === "win32" ? ".exe" : "";
  if (process.env.JAVA_HOME) {
    const ruta = path.join(process.env.JAVA_HOME, "bin", nombre + extension);
    if (fs.existsSync(ruta)) return ruta;
  }
  return nombre;
}

function ubicar(nombre) {
  const ejecutable = binario(nombre);
  if (path.isAbsolute(ejecutable)) return ejecutable;
  const extension = process.platform === "win32" ? ".exe" : "";
  for (const carpeta of (process.env.PATH || "").split(path.delimiter)) {
    const ruta = path.join(carpeta, nombre + extension);
    if (carpeta && fs.existsSync(ruta)) return ruta;
  }
  return nombre;
}

// Identifica el Java instalado, para no reutilizar clases compiladas con otra versión.
function versionJava() {
  return ["javac", "java"].map((nombre) => {
    const ruta = ubicar(nombre);
    try {
      const real = fs.realpathSync(ruta);
      const datos = fs.statSync(real);
      return `${real}:${datos.size}:${datos.mtimeMs}`;
    } catch {
      return ruta;
    }
  }).join("|");
}

function traducirCompilacion(texto) {
  const lineas = texto.split(/\r?\n/);
  const indice = lineas.findIndex((l) => /\.java:\d+: error: /.test(l));
  if (indice === -1) return `Tu código no compila: ${lineas[0] || "error desconocido"}`;

  const [, archivo, numero, mensaje] = lineas[indice].match(/([\w]+\.java):(\d+): error: (.*)$/);
  const contexto = lineas.slice(indice, indice + 6).join("\n");
  const simbolo = (contexto.match(/symbol:\s+\w+\s+(\w+)/) || [])[1];
  let explicacion = mensaje;

  if (/';' expected/.test(mensaje)) explicacion = "falta un punto y coma (;)";
  else if (/incompatible types: (\S+) cannot be converted to (\S+)/.test(mensaje)) {
    const [, de, a] = mensaje.match(/incompatible types: (\S+) cannot be converted to (\S+)/);
    explicacion = `tipos incompatibles: un ${de} no se puede guardar en un ${a}`;
  } else if (/possible lossy conversion from (\w+) to (\w+)/.test(mensaje)) {
    const [, de, a] = mensaje.match(/from (\w+) to (\w+)/);
    explicacion = `tipos incompatibles: guardar un ${de} en un ${a} perdería información`;
  } else if (/cannot find symbol/.test(mensaje)) {
    explicacion = simbolo
      ? `no encuentro «${simbolo}»: ¿lo declaraste? ¿lo escribiste igual, con mayúsculas y minúsculas?`
      : "usas algo que no está declarado: revisa los nombres";
  } else if (/is public, should be declared in a file named/.test(mensaje)) {
    explicacion = "la clase debe llamarse igual que el archivo: no le cambies el nombre";
  } else if (/reached end of file while parsing/.test(mensaje)) {
    explicacion = "falta cerrar una llave }";
  } else if (/class, interface, enum, or record expected/.test(mensaje)) {
    explicacion = "hay una llave } de más o código por fuera de la clase";
  } else if (/missing return statement/.test(mensaje)) {
    explicacion = "a un método le falta el return";
  } else if (/invalid method declaration; return type required/.test(mensaje)) {
    explicacion = "el constructor debe llamarse exactamente igual que la clase (y un método necesita su tipo de retorno)";
  } else if (/unclosed string literal/.test(mensaje)) {
    explicacion = "falta cerrar unas comillas \"";
  } else if (/might not have been initialized/.test(mensaje)) {
    explicacion = `la variable ${(mensaje.match(/variable (\w+)/) || [])[1] || ""} no tiene valor en todos los caminos`;
  } else if (/is already defined/.test(mensaje)) {
    explicacion = "declaraste dos veces lo mismo (un campo, una variable o un método)";
  } else if (/unreported exception/.test(mensaje)) {
    explicacion = "esa excepción no se lanza así: usa IllegalArgumentException, como en la clase";
  } else if (/unreachable statement/.test(mensaje)) {
    explicacion = "hay código que nunca se ejecuta (queda después de un throw, un return o un ciclo que no termina)";
  } else if (/non-static (method|variable) (\w+)/.test(mensaje)) {
    const nombre = mensaje.match(/non-static (?:method|variable) (\w+)/)[1];
    explicacion = `usas «${nombre}» desde un método static sin un objeto: ¿le falta static, o necesitas llamarlo sobre un objeto?`;
  } else if (/has private access in (\w+)/.test(mensaje)) {
    const [, nombre, clase] = mensaje.match(/(\w+) has private access in (\w+)/);
    explicacion = `«${nombre}» es private en ${clase}: desde otra clase usa su getter o su método público`;
  } else if (/not a statement/.test(mensaje)) {
    explicacion = "hay una línea que no es una instrucción completa";
  } else if (/'\)' expected|'\(' expected/.test(mensaje)) {
    explicacion = "revisa los paréntesis";
  } else if (/illegal start of (expression|type)/.test(mensaje)) {
    explicacion = "hay algo en un lugar que no le corresponde: revisa llaves y paréntesis alrededor de esa línea";
  }
  return `Tu código no compila (${archivo}, línea ${numero}): ${explicacion}`;
}

function huella(archivos, programa) {
  const hash = crypto.createHash("sha1");
  for (const archivo of archivos) {
    hash.update(archivo);
    hash.update(fs.existsSync(path.join(CARPETA, archivo)) ? fs.readFileSync(path.join(CARPETA, archivo)) : "");
  }
  hash.update(fs.readFileSync(SONDA));
  hash.update(fs.readFileSync(__filename));
  hash.update(versionJava());
  hash.update(programa);
  return hash.digest("hex");
}

function compilar(archivos, programa) {
  const destino = path.join(CACHE, huella(archivos, programa));
  if (fs.existsSync(path.join(destino, "error.txt"))) return { error: fs.readFileSync(path.join(destino, "error.txt"), "utf8") };
  if (fs.existsSync(path.join(destino, "Revisor.class"))) return { carpeta: destino };

  for (const archivo of archivos) {
    if (!fs.existsSync(path.join(CARPETA, archivo))) return { error: `No encuentro el archivo ejercicios/${archivo}: no lo borres ni le cambies el nombre` };
  }

  fs.mkdirSync(CACHE, { recursive: true });
  const temporal = fs.mkdtempSync(path.join(CACHE, "tmp-"));
  const fuentes = path.join(temporal, "fuentes");
  fs.mkdirSync(fuentes);
  for (const archivo of archivos) fs.copyFileSync(path.join(CARPETA, archivo), path.join(fuentes, archivo));
  fs.copyFileSync(SONDA, path.join(fuentes, "Sonda.java"));
  fs.writeFileSync(path.join(fuentes, "Revisor.java"), programa);

  const proceso = spawnSync(
    binario("javac"),
    ["-J-Duser.language=en", "-J-Duser.country=US", "-encoding", "UTF-8", "-nowarn", "-d", temporal,
      ...archivos.map((a) => path.join(fuentes, a)), path.join(fuentes, "Sonda.java"), path.join(fuentes, "Revisor.java")],
    { encoding: "utf8", env: entorno(), timeout: 60000 }
  );
  if (proceso.error && proceso.error.code === "ENOENT") {
    assert.fail("No encuentro Java (javac) en tu computador: revisa la sección «Errores frecuentes» del README");
  }

  let resultado;
  if (proceso.status === 0) {
    resultado = { carpeta: destino };
  } else {
    const error = traducirCompilacion((proceso.stderr || "") + (proceso.stdout || ""));
    fs.writeFileSync(path.join(temporal, "error.txt"), error);
    resultado = { error };
  }
  fs.rmSync(fuentes, { recursive: true, force: true });
  try {
    fs.renameSync(temporal, destino);
  } catch {
    fs.rmSync(temporal, { recursive: true, force: true });
  }
  return resultado;
}

function programaRevisor(chequeos) {
  const lineas = Object.entries(chequeos).map(
    ([id, cuerpo]) => `        Sonda.chequear("${id}", () -> { ${cuerpo} });`
  );
  return [
    "public class Revisor {",
    "    static Object nuevo(String c, Object... a) throws Exception { return Sonda.nuevo(c, a); }",
    "    static Object llamar(Object o, String m, Object... a) throws Exception { return Sonda.llamar(o, m, a); }",
    "    static Object estatico(String c, String m, Object... a) throws Exception { return Sonda.estatico(c, m, a); }",
    "    public static void main(String[] args) {",
    ...lineas,
    "    }",
    "}",
    "",
  ].join("\n");
}

// Compila y ejecuta los chequeos de un ejercicio. Se llama una vez por archivo de tests.
//   archivos: las clases del estudiante que necesita (ej. ["Socio.java", "Plan.java", "Membresia.java"])
//   chequeos: { id: "código Java que retorna un valor" }
function revisar(archivos, chequeos) {
  const programa = programaRevisor(chequeos);
  const compilacion = compilar(archivos, programa);
  if (compilacion.error) return { error: compilacion.error, resultados: {} };

  const proceso = spawnSync(
    binario("java"),
    ["-Dstdout.encoding=UTF-8", "-Dfile.encoding=UTF-8", "-Duser.language=en", "-Duser.country=US",
      "-XX:TieredStopAtLevel=1", "-cp", compilacion.carpeta, "Revisor"],
    { input: "", encoding: "utf8", env: entorno(), timeout: TIEMPO_EJECUCION_MS, maxBuffer: 2 * 1024 * 1024 }
  );
  if (proceso.error && ["ETIMEDOUT", "ENOBUFS"].includes(proceso.error.code)) {
    return { error: "Tiempo agotado: tu código no termina (¿un ciclo infinito?)", resultados: {} };
  }

  if (/UnsupportedClassVersionError/.test(proceso.stderr || "")) {
    fs.rmSync(compilacion.carpeta, { recursive: true, force: true });
    return { error: "Tu javac y tu java son de versiones distintas (o cambiaste de JDK): vuelve a correr npm test; si sigue, revisa que JAVA_HOME y el PATH apunten al mismo JDK", resultados: {} };
  }

  const resultados = {};
  for (const linea of (proceso.stdout || "").split(/\r?\n/)) {
    const m = linea.match(/^##([^|]+)\|(OK|FALTA|EXC)\|(.*)$/);
    if (!m) continue;
    const [, id, tipo, resto] = m;
    if (tipo === "EXC") {
      const separador = resto.indexOf("|");
      resultados[id] = { tipo, excepcion: resto.slice(0, separador), mensaje: resto.slice(separador + 1) };
    } else {
      resultados[id] = { tipo, valor: resto };
    }
  }
  return { error: "", resultados };
}

function obtener(r, id) {
  if (r.error) assert.fail(r.error);
  const resultado = r.resultados[id];
  if (!resultado) assert.fail("Tu código se detuvo antes de terminar la revisión (¿llamaste a System.exit?)");
  if (resultado.tipo === "FALTA") assert.fail(resultado.valor);
  return resultado;
}

// El chequeo debe entregar exactamente "esperado".
function esperarValor(r, id, esperado, descripcion, pista = "") {
  const resultado = obtener(r, id);
  const extra = pista ? ` (${pista})` : "";
  if (resultado.tipo === "EXC") {
    const detalle = resultado.mensaje ? `: ${resultado.mensaje}` : "";
    assert.fail(`${descripcion}, pero tu código lanzó ${resultado.excepcion}${detalle}${extra}`);
  }
  assert.equal(resultado.valor, String(esperado), `${descripcion}: esperaba ${esperado} y obtuve ${resultado.valor}${extra}`);
}

// El chequeo debe lanzar IllegalArgumentException.
function esperarRechazo(r, id, descripcion, pista = "") {
  const resultado = obtener(r, id);
  const extra = pista ? ` (${pista})` : "";
  if (resultado.tipo === "OK") assert.fail(`${descripcion} debería lanzar IllegalArgumentException, pero no lanzó ninguna excepción${extra}`);
  if (resultado.excepcion !== "IllegalArgumentException") {
    const nulo = resultado.excepcion === "NullPointerException" ? " (revisa primero si el dato es null, antes de usarlo)" : extra;
    assert.fail(`${descripcion} lanzó ${resultado.excepcion} y debería lanzar IllegalArgumentException${nulo}`);
  }
}

// El chequeo de estructura debe responder "OK"; si no, su respuesta es el mensaje.
function esperarEstructura(r, id) {
  const resultado = obtener(r, id);
  if (resultado.tipo === "EXC") assert.fail(`La revisión lanzó ${resultado.excepcion}: ${resultado.mensaje}`);
  if (resultado.valor !== "OK") assert.fail(resultado.valor);
}

module.exports = { revisar, esperarValor, esperarRechazo, esperarEstructura };
