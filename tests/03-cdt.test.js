const test = require("node:test");
const { revisar, esperarValor, esperarEstructura } = require("./java");

const CDT = 'nuevo("Cdt", 1_000_000L, 90, 0.09)';

function intento(expresion, etiqueta) {
  return `try { ${expresion}; respuesta += "${etiqueta} aceptado; "; } catch (IllegalArgumentException e) { respuesta += "${etiqueta} rechazado; "; }`;
}

const r = revisar(["Cdt.java"], {
  datos: `
    Object c = ${CDT};
    return llamar(c, "getMonto") + " / " + llamar(c, "getDias") + " / " + llamar(c, "getTasaAnual");`,
  intereses: `return llamar(${CDT}, "calcularIntereses");`,
  total: `return llamar(${CDT}, "calcularTotalAlVencimiento");`,
  simulacion: `
    Object c = ${CDT};
    return llamar(c, "calcularIntereses", 180) + " / " + llamar(c, "getDias");`,
  monto: `
    String respuesta = "";
    ${intento('nuevo("Cdt", 499_999L, 90, 0.09)', "499999")}
    ${intento('nuevo("Cdt", 500_000L, 90, 0.09)', "500000")}
    return respuesta.trim();`,
  dias: `
    String respuesta = "";
    ${intento('nuevo("Cdt", 1_000_000L, 29, 0.09)', "29")}
    ${intento('nuevo("Cdt", 1_000_000L, 30, 0.09)', "30")}
    ${intento('nuevo("Cdt", 1_000_000L, 540, 0.09)', "540")}
    ${intento('nuevo("Cdt", 1_000_000L, 541, 0.09)', "541")}
    return respuesta.trim();`,
  simulacionInvalida: `
    Object c = ${CDT};
    String respuesta = "";
    ${intento('llamar(c, "calcularIntereses", 20)', "20 días")}
    return respuesta.trim();`,
  tasa: `
    String respuesta = "";
    ${intento('nuevo("Cdt", 1_000_000L, 90, 0.0)', "0")}
    ${intento('nuevo("Cdt", 1_000_000L, 90, 0.2)', "0.2")}
    ${intento('nuevo("Cdt", 1_000_000L, 90, 0.25)', "0.25")}
    return respuesta.trim();`,
  estructura: `
    String[][] constantes = { {"MONTO_MINIMO", "500000"}, {"DIAS_MINIMOS", "30"}, {"DIAS_MAXIMOS", "540"} };
    for (String[] c : constantes) {
      String r = Sonda.constante("Cdt", c[0], c[1]);
      if (!r.equals("OK")) return r;
    }
    String privados = Sonda.camposPrivados("Cdt", 3);
    if (!privados.equals("OK")) return privados;
    return Sonda.metodoPrivado("Cdt", "validarDias", "sirve para no repetir la regla de los días");`,
});

test("el CDT guarda monto, días y tasa", () => {
  esperarValor(r, "datos", "1000000 / 90 / 0.09", "new Cdt(1000000, 90, 0.09): getMonto() / getDias() / getTasaAnual()");
});

test("calcularIntereses() usa los días del CDT", () => {
  esperarValor(r, "intereses", "22500", "Cdt de 1000000 a 90 días al 0.09: calcularIntereses()", "monto × tasaAnual × días / 360, con Math.round");
});

test("calcularTotalAlVencimiento() suma monto e intereses", () => {
  esperarValor(r, "total", "1022500", "Cdt de 1000000 a 90 días al 0.09: calcularTotalAlVencimiento()", "reutiliza calcularIntereses()");
});

test("calcularIntereses(int) simula otro plazo sin cambiar el CDT", () => {
  esperarValor(r, "simulacion", "45000 / 90", "calcularIntereses(180) / getDias()", "la sobrecarga calcula con otrosDias y no modifica el campo dias");
});

test("el monto mínimo es 500000", () => {
  esperarValor(r, "monto", "499999 rechazado; 500000 aceptado;", "new Cdt(499999, …) y new Cdt(500000, …)", "500000 sí es válido: compara con < MONTO_MINIMO");
});

test("los días van de 30 a 540, con los límites válidos", () => {
  esperarValor(r, "dias", "29 rechazado; 30 aceptado; 540 aceptado; 541 rechazado;", "new Cdt(…, 29 / 30 / 540 / 541, …)", "revisa < y > en validarDias");
});

test("la simulación también valida los días", () => {
  esperarValor(r, "simulacionInvalida", "20 días rechazado;", "calcularIntereses(20) debería lanzar IllegalArgumentException", "llama validarDias(otrosDias)");
});

test("la tasa debe ser mayor que 0 y máximo 0.2", () => {
  esperarValor(r, "tasa", "0 rechazado; 0.2 aceptado; 0.25 rechazado;", "new Cdt(…, …, 0.0 / 0.2 / 0.25)", "0.2 es válido; 0 no");
});

test("constantes public static final, campos privados y validarDias private", () => {
  esperarEstructura(r, "estructura");
});
