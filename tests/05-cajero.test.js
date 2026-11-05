const test = require("node:test");
const { revisar, esperarValor, esperarRechazo } = require("./java");

const CUENTA = `
    Object cuenta = nuevo("CuentaAhorros", "001-458", nuevo("Titular", "Laura Pérez", "1032456789"));
    llamar(cuenta, "depositar", 200_000L);`;

const r = revisar(["Titular.java", "CuentaAhorros.java", "Tarifas.java", "Cajero.java"], {
  leer: `return estatico("Cajero", "leerMonto", "50000");`,
  leerTexto: `
    try { estatico("Cajero", "leerMonto", "cincuenta mil"); return "sin excepción"; }
    catch (IllegalArgumentException e) { return e.getClass().getSimpleName() + ": " + e.getMessage(); }`,
  leerCero: `return estatico("Cajero", "leerMonto", "0");`,
  propio: `${CUENTA}
    return estatico("Cajero", "retirar", cuenta, "50000", true);`,
  otroBanco: `${CUENTA}
    return estatico("Cajero", "retirar", cuenta, "50000", false);`,
  insuficiente: `${CUENTA}
    Object mensaje = estatico("Cajero", "retirar", cuenta, "900000", true);
    String inicio = String.valueOf(mensaje).startsWith("Retiro rechazado: ") ? "rechazado" : String.valueOf(mensaje);
    return inicio + " / saldo " + llamar(cuenta, "getSaldo");`,
  textoInvalido: `${CUENTA}
    return estatico("Cajero", "retirar", cuenta, "abc", true);`,
});

test("leerMonto convierte el texto a número", () => {
  esperarValor(r, "leer", "50000", 'Cajero.leerMonto("50000")', "usa Long.parseLong(texto)");
});

test("leerMonto convierte el error de formato en IllegalArgumentException con el mensaje pedido", () => {
  esperarValor(r, "leerTexto", "IllegalArgumentException: El monto debe ser un número entero: cincuenta mil", 'Cajero.leerMonto("cincuenta mil")', "atrapa NumberFormatException y lanza IllegalArgumentException con el mensaje exacto");
});

test("leerMonto rechaza el 0", () => {
  esperarRechazo(r, "leerCero", 'Cajero.leerMonto("0")', "valida monto <= 0 después de convertir");
});

test("retiro en cajero propio: sin costo", () => {
  esperarValor(r, "propio", "Retiro exitoso. Nuevo saldo: $150000", 'Cuenta con 200000: Cajero.retirar(cuenta, "50000", true)', "retira el monto más Tarifas.costoRetiro(cajeroPropio)");
});

test("retiro en cajero de otro banco: descuenta el costo", () => {
  esperarValor(r, "otroBanco", "Retiro exitoso. Nuevo saldo: $143000", 'Cuenta con 200000: Cajero.retirar(cuenta, "50000", false)', "50000 + 7000 de costo");
});

test("un retiro sin saldo devuelve el rechazo y no toca la cuenta", () => {
  esperarValor(r, "insuficiente", "rechazado / saldo 200000", 'Cuenta con 200000: Cajero.retirar(cuenta, "900000", true) / getSaldo()', "atrapa IllegalArgumentException y devuelve \"Retiro rechazado: \" + e.getMessage()");
});

test("un texto que no es número devuelve el rechazo con su mensaje", () => {
  esperarValor(r, "textoInvalido", "Retiro rechazado: El monto debe ser un número entero: abc", 'Cajero.retirar(cuenta, "abc", true)', "el try debe envolver también la llamada a leerMonto");
});
