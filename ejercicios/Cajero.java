// ============================================================
// Ejercicio 05 · Integrador con try/catch · Cajero
// ============================================================
// En el cajero, el cliente escribe el monto como texto. El cajero
// nunca se puede "caer": si algo sale mal, muestra un mensaje.
// Usa Titular (01), CuentaAhorros (02) y Tarifas (04).
//
// Construye la clase Cajero con dos métodos public static:
//
//   public static long leerMonto(String texto)
//       · Convierte el texto con Long.parseLong(texto).
//       · Si el texto no es un número, Long.parseLong lanza
//         NumberFormatException: atrápala y lanza en su lugar
//         IllegalArgumentException con el mensaje exacto
//         "El monto debe ser un número entero: " + texto
//       · Si el número es 0 o negativo → IllegalArgumentException.
//       · Si todo está bien, devuelve el número.
//
//   public static String retirar(CuentaAhorros cuenta, String textoMonto, boolean cajeroPropio)
//       · Lee el monto con leerMonto.
//       · Calcula el costo con Tarifas.costoRetiro(cajeroPropio).
//       · Retira de la cuenta el monto MÁS el costo.
//       · Si salió bien, devuelve:
//           "Retiro exitoso. Nuevo saldo: $" + el saldo nuevo
//       · Si cualquier paso lanza IllegalArgumentException, la
//         atrapa y devuelve:
//           "Retiro rechazado: " + el mensaje de la excepción
//       · Este método NUNCA lanza excepciones.
//
// Ejemplos (cuenta con $200000):
//   Cajero.leerMonto("50000")                 → 50000
//   Cajero.retirar(cuenta, "50000", true)     → "Retiro exitoso. Nuevo saldo: $150000"
//   Cajero.retirar(cuenta, "50000", false)    → "Retiro exitoso. Nuevo saldo: $143000"
//   Cajero.retirar(cuenta, "abc", true)
//       → "Retiro rechazado: El monto debe ser un número entero: abc"
//
// Pista: e.getMessage() devuelve el mensaje de la excepción atrapada.
// ============================================================

public class Cajero {

    public static long leerMonto(String texto) {
        long monto;
        try {
            monto = Long.parseLong(texto);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("El monto debe ser un número entero: " + texto);
        }
        if (monto <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor que 0");
        }
        return monto;
    }

    public static String retirar(CuentaAhorros cuenta, String textoMonto, boolean cajeroPropio) {
        try {
            long monto = leerMonto(textoMonto);
            long costo = Tarifas.costoRetiro(cajeroPropio);
            cuenta.retirar(monto + costo);
            return "Retiro exitoso. Nuevo saldo: $" + cuenta.getSaldo();
        } catch (IllegalArgumentException e) {
            return "Retiro rechazado: " + e.getMessage();
        }
    }

}
