// ============================================================
// Ejercicio 02 · Métodos que cambian el estado · CuentaAhorros
// ============================================================
// Cada titular puede tener una cuenta de ahorros. El saldo solo
// cambia con depósitos y retiros: nadie lo escribe a mano.
// Usa la clase Titular del ejercicio 01.
//
// Construye la clase CuentaAhorros:
//   - Tres campos privados: numero (String), titular (de tipo
//     Titular) y saldo (long). El saldo empieza en 0.
//   - Un campo private static int cuentasAbiertas, que cuenta
//     cuántas cuentas se han creado con éxito.
//   - Un constructor público CuentaAhorros(String numero, Titular titular).
//       · numero null o en blanco  → IllegalArgumentException
//       · titular null             → IllegalArgumentException
//       · Si todo está bien, suma 1 a cuentasAbiertas.
//         (Una cuenta rechazada NO se cuenta.)
//   - Getters: getNumero(), getTitular() y getSaldo().
//   - Un getter public static int getCuentasAbiertas().
//   - NO hay setSaldo.
//   - public void depositar(long valor)
//       · valor 0 o negativo → IllegalArgumentException
//       · si no, suma el valor al saldo.
//   - public void retirar(long valor)
//       · valor 0 o negativo → IllegalArgumentException
//       · valor mayor que el saldo → IllegalArgumentException con
//         el mensaje "Saldo insuficiente. Saldo: $X, retiro: $Y"
//       · si no, resta el valor del saldo. Retirar TODO el saldo sí se puede.
//
// Ejemplos:
//   CuentaAhorros cuenta = new CuentaAhorros("001-458", laura);
//   cuenta.getSaldo()       → 0
//   cuenta.depositar(200000);
//   cuenta.retirar(50000);
//   cuenta.getSaldo()       → 150000
//   cuenta.retirar(900000)  → IllegalArgumentException y el saldo sigue en 150000
//
// Ojo: si Titular no compila, este ejercicio tampoco.
// ============================================================

public class CuentaAhorros {

    // Tu código aquí

}
