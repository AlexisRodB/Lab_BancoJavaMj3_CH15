const test = require("node:test");
const { revisar, esperarValor, esperarRechazo, esperarEstructura } = require("./java");

const r = revisar(["Tarifas.java"], {
  retiroSimple: `return estatico("Tarifas", "costoRetiro", true) + " / " + estatico("Tarifas", "costoRetiro", false);`,
  gratis: `return estatico("Tarifas", "costoRetiro", true, 1) + " / " + estatico("Tarifas", "costoRetiro", true, 3);`,
  adicional: `return estatico("Tarifas", "costoRetiro", true, 4) + " / " + estatico("Tarifas", "costoRetiro", true, 10);`,
  otroBanco: `return estatico("Tarifas", "costoRetiro", false, 1) + " / " + estatico("Tarifas", "costoRetiro", false, 5);`,
  retiroCero: `return estatico("Tarifas", "costoRetiro", true, 0);`,
  cuota: `return estatico("Tarifas", "cuotaManejo", 999_999L) + " / " + estatico("Tarifas", "cuotaManejo", 1_000_000L);`,
  cuotaNegativa: `return estatico("Tarifas", "cuotaManejo", -1L);`,
  constantes: `
    String[][] constantes = {
      {"COSTO_RETIRO_OTRO_BANCO", "7000"}, {"COSTO_RETIRO_ADICIONAL", "2000"},
      {"RETIROS_GRATIS_AL_MES", "3"}, {"CUOTA_MANEJO", "12900"}, {"SALDO_SIN_CUOTA", "1000000"} };
    for (String[] c : constantes) {
      String r = Sonda.constante("Tarifas", c[0], c[1]);
      if (!r.equals("OK")) return r;
    }
    return "OK";`,
});

test("costoRetiro(boolean): cajero propio 0, otro banco 7000", () => {
  esperarValor(r, "retiroSimple", "0 / 7000", "Tarifas.costoRetiro(true) / Tarifas.costoRetiro(false)", "los métodos son static: se llaman con el nombre de la clase");
});

test("los primeros 3 retiros en cajero propio son gratis", () => {
  esperarValor(r, "gratis", "0 / 0", "Tarifas.costoRetiro(true, 1) / Tarifas.costoRetiro(true, 3)", "el 3.º retiro todavía es gratis: usa <= RETIROS_GRATIS_AL_MES");
});

test("del 4.º retiro en adelante, en cajero propio, cuesta 2000", () => {
  esperarValor(r, "adicional", "2000 / 2000", "Tarifas.costoRetiro(true, 4) / Tarifas.costoRetiro(true, 10)");
});

test("en cajero de otro banco siempre cuesta 7000", () => {
  esperarValor(r, "otroBanco", "7000 / 7000", "Tarifas.costoRetiro(false, 1) / Tarifas.costoRetiro(false, 5)", "revisa primero si el cajero es de otro banco");
});

test("el número de retiro empieza en 1", () => {
  esperarRechazo(r, "retiroCero", "Tarifas.costoRetiro(true, 0)", "valida numeroDeRetiro < 1");
});

test("cuota de manejo: 12900, y 0 con saldo de 1000000 o más", () => {
  esperarValor(r, "cuota", "12900 / 0", "Tarifas.cuotaManejo(999999) / Tarifas.cuotaManejo(1000000)", "1000000 ya no paga cuota: usa >=");
});

test("un saldo promedio negativo se rechaza", () => {
  esperarRechazo(r, "cuotaNegativa", "Tarifas.cuotaManejo(-1)");
});

test("las cinco constantes existen, son public static final y tienen su valor", () => {
  esperarEstructura(r, "constantes");
});
