const test = require("node:test");
const { revisar, esperarValor, esperarRechazo, esperarEstructura } = require("./java");

const TITULAR = 'nuevo("Titular", "Laura Pérez", "1032456789")';
const CUENTA = `nuevo("CuentaAhorros", "001-458", ${TITULAR})`;

const r = revisar(["Titular.java", "CuentaAhorros.java"], {
  datos: `
    Object c = ${CUENTA};
    Object titular = llamar(c, "getTitular");
    return llamar(c, "getNumero") + " / " + llamar(titular, "getNombre") + " / " + llamar(c, "getSaldo");`,
  deposita: `
    Object c = ${CUENTA};
    llamar(c, "depositar", 200_000L);
    llamar(c, "depositar", 35_000L);
    return llamar(c, "getSaldo");`,
  depositoInvalido: `
    Object c = ${CUENTA};
    String respuesta = "";
    try { llamar(c, "depositar", 0L); respuesta += "0 aceptado; "; } catch (IllegalArgumentException e) { respuesta += "0 rechazado; "; }
    try { llamar(c, "depositar", -5_000L); respuesta += "-5000 aceptado"; } catch (IllegalArgumentException e) { respuesta += "-5000 rechazado"; }
    return respuesta + " / saldo " + llamar(c, "getSaldo");`,
  retira: `
    Object c = ${CUENTA};
    llamar(c, "depositar", 200_000L);
    llamar(c, "retirar", 50_000L);
    return llamar(c, "getSaldo");`,
  retiroTotal: `
    Object c = ${CUENTA};
    llamar(c, "depositar", 80_000L);
    llamar(c, "retirar", 80_000L);
    return llamar(c, "getSaldo");`,
  sobregiro: `
    Object c = ${CUENTA};
    llamar(c, "depositar", 150_000L);
    String respuesta;
    try { llamar(c, "retirar", 900_000L); respuesta = "aceptado"; } catch (IllegalArgumentException e) { respuesta = e.getMessage(); }
    return respuesta + " / saldo " + llamar(c, "getSaldo");`,
  retiroCero: `
    Object c = ${CUENTA};
    llamar(c, "depositar", 10_000L);
    llamar(c, "retirar", 0L);
    return "aceptado";`,
  contador: `
    int antes = (Integer) estatico("CuentaAhorros", "getCuentasAbiertas");
    nuevo("CuentaAhorros", "001-001", ${TITULAR});
    nuevo("CuentaAhorros", "001-002", ${TITULAR});
    try { nuevo("CuentaAhorros", "001-003", null); } catch (IllegalArgumentException e) { }
    int despues = (Integer) estatico("CuentaAhorros", "getCuentasAbiertas");
    return despues - antes;`,
  sinTitular: 'return nuevo("CuentaAhorros", "001-458", null);',
  estructura: `
    String titular = Sonda.campoDeTipo("CuentaAhorros", "Titular");
    if (!titular.equals("OK")) return titular;
    String privados = Sonda.camposPrivados("CuentaAhorros", 3);
    if (!privados.equals("OK")) return privados;
    String contador = Sonda.campoEstatico("CuentaAhorros", "cuentasAbiertas");
    if (!contador.equals("OK")) return contador;
    return Sonda.sinMetodo("CuentaAhorros", "setSaldo");`,
});

test("la cuenta guarda número y titular, y nace con saldo 0", () => {
  esperarValor(r, "datos", "001-458 / Laura Pérez / 0", 'new CuentaAhorros("001-458", laura): getNumero() / getTitular().getNombre() / getSaldo()', "getTitular() entrega el objeto Titular completo");
});

test("depositar suma al saldo", () => {
  esperarValor(r, "deposita", "235000", "depositar(200000) y depositar(35000): getSaldo()", "saldo = saldo + valor");
});

test("depósitos de 0 o negativos se rechazan sin tocar el saldo", () => {
  esperarValor(r, "depositoInvalido", "0 rechazado; -5000 rechazado / saldo 0", "depositar(0) y depositar(-5000) deberían lanzar IllegalArgumentException", "¿validaste valor <= 0, con el igual?");
});

test("retirar resta del saldo", () => {
  esperarValor(r, "retira", "150000", "Saldo 200000, retirar(50000): getSaldo()");
});

test("se puede retirar todo el saldo", () => {
  esperarValor(r, "retiroTotal", "0", "Saldo 80000, retirar(80000): getSaldo()", "retirar exactamente el saldo es válido: rechaza solo valor > saldo");
});

test("un retiro mayor que el saldo se rechaza con el mensaje pedido", () => {
  esperarValor(r, "sobregiro", "Saldo insuficiente. Saldo: $150000, retiro: $900000 / saldo 150000", "Saldo 150000, retirar(900000): el mensaje de la excepción / getSaldo()", "valida antes de restar y copia el mensaje exacto del enunciado");
});

test("un retiro de 0 se rechaza", () => {
  esperarRechazo(r, "retiroCero", "retirar(0)", "¿validaste valor <= 0 también en retirar?");
});

test("el contador static cuenta solo las cuentas creadas con éxito", () => {
  esperarValor(r, "contador", "2", "Se crean 2 cuentas válidas y 1 sin titular: cuántas suma getCuentasAbiertas()", "suma 1 al final del constructor, después de validar");
});

test("una cuenta sin titular no se crea", () => {
  esperarRechazo(r, "sinTitular", 'new CuentaAhorros("001-458", null)', "valida titular == null");
});

test("guarda un objeto Titular, campos privados, contador static y sin setSaldo", () => {
  esperarEstructura(r, "estructura");
});
