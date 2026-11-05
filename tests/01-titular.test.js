const test = require("node:test");
const { revisar, esperarValor, esperarRechazo, esperarEstructura } = require("./java");

const LAURA = 'nuevo("Titular", "Laura Pérez", "1032456789")';

const r = revisar(["Titular.java"], {
  datos: `
    Object t = ${LAURA};
    return llamar(t, "getNombre") + " / " + llamar(t, "getDocumento");`,
  celularInicial: `return llamar(${LAURA}, "getCelular");`,
  celularValido: `
    Object t = ${LAURA};
    llamar(t, "setCelular", "3104567890");
    return llamar(t, "getCelular");`,
  celularCorto: `
    Object t = ${LAURA};
    llamar(t, "setCelular", "3104567890");
    String respuesta;
    try { llamar(t, "setCelular", "310456789"); respuesta = "aceptado"; } catch (IllegalArgumentException e) { respuesta = "rechazado"; }
    return respuesta + " / " + llamar(t, "getCelular");`,
  celularFijo: `
    Object t = ${LAURA};
    llamar(t, "setCelular", "6014567890");
    return "aceptado";`,
  nombreBlanco: 'return nuevo("Titular", "   ", "1032456789");',
  documentoNulo: 'return nuevo("Titular", "Laura Pérez", null);',
  estructura: `
    String privados = Sonda.camposPrivados("Titular", 3);
    if (!privados.equals("OK")) return privados;
    String vacio = Sonda.sinConstructorVacio("Titular");
    if (!vacio.equals("OK")) return vacio;
    String documento = Sonda.sinMetodo("Titular", "setDocumento");
    if (!documento.equals("OK")) return documento;
    return Sonda.sinMetodo("Titular", "setNombre");`,
});

test("el titular guarda su nombre y su documento", () => {
  esperarValor(r, "datos", "Laura Pérez / 1032456789", 'new Titular("Laura Pérez", "1032456789"): getNombre() / getDocumento()', "¿guardaste los datos con this?");
});

test("el celular empieza sin valor (null)", () => {
  esperarValor(r, "celularInicial", "null", "getCelular() de un titular recién creado", "el celular no va en el constructor: su valor por defecto es null");
});

test("setCelular guarda un celular válido", () => {
  esperarValor(r, "celularValido", "3104567890", 'setCelular("3104567890") y luego getCelular()');
});

test("un celular de 9 dígitos se rechaza y deja el anterior", () => {
  esperarValor(r, "celularCorto", "rechazado / 3104567890", 'setCelular("310456789") debería lanzar IllegalArgumentException y dejar el celular anterior', "revisa length() != 10 y valida antes de asignar");
});

test("un teléfono fijo (no empieza por 3) se rechaza", () => {
  esperarRechazo(r, "celularFijo", 'setCelular("6014567890")', "usa startsWith(\"3\")");
});

test("un nombre en blanco no crea el titular", () => {
  esperarRechazo(r, "nombreBlanco", 'new Titular("   ", "1032456789")', "usa isBlank(), que también detecta los espacios");
});

test("un documento null no crea el titular", () => {
  esperarRechazo(r, "documentoNulo", 'new Titular("Laura Pérez", null)', "revisa documento == null antes de usar isBlank()");
});

test("campos privados, sin constructor vacío y sin setters de nombre y documento", () => {
  esperarEstructura(r, "estructura");
});
