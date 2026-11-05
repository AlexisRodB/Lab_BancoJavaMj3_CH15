// ============================================================
// Ejercicio 03 · Métodos que devuelven y sobrecarga · Cdt
// ============================================================
// Un CDT (certificado de depósito a término) guarda un monto
// durante unos días y paga intereses al final.
// Regla de Banco Cordillera: interés simple con año de 360 días.
//
//     intereses = monto × tasaAnual × días / 360   (redondeado)
//
// Construye la clase Cdt:
//   - Tres constantes public static final:
//       MONTO_MINIMO = 500_000 (long)
//       DIAS_MINIMOS = 30      (int)
//       DIAS_MAXIMOS = 540     (int)
//   - Tres campos privados: monto (long), dias (int) y tasaAnual (double).
//   - Un constructor público Cdt(long monto, int dias, double tasaAnual).
//       · monto menor que MONTO_MINIMO           → IllegalArgumentException
//       · dias fuera de 30 a 540 (límites válidos) → IllegalArgumentException
//       · tasaAnual 0 o menos, o mayor que 0.2   → IllegalArgumentException
//   - Getters: getMonto(), getDias() y getTasaAnual(). Sin setters.
//   - public long calcularIntereses()  → con los días del CDT.
//   - public long calcularIntereses(int otrosDias) → simula otro plazo
//     sin cambiar el CDT. Los otrosDias siguen la misma regla de 30 a 540.
//   - public long calcularTotalAlVencimiento() → monto + intereses.
//   - Un método private void validarDias(int dias) con la regla de los
//     días. Úsalo en el constructor y en calcularIntereses(int), para
//     no escribir el mismo if dos veces.
//
// Ejemplos:
//   Cdt cdt = new Cdt(1_000_000, 90, 0.09);
//   cdt.calcularIntereses()            → 22500
//   cdt.calcularTotalAlVencimiento()   → 1022500
//   cdt.calcularIntereses(180)         → 45000  (y getDias() sigue en 90)
//   new Cdt(499_999, 90, 0.09)         → IllegalArgumentException
//
// Pista: Math.round(...) redondea un double y devuelve un long.
// ============================================================

public class Cdt {

    // Tu código aquí

}
