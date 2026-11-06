// ============================================================
// Ejercicio 01 · Clase, constructor y setter · Titular
// ============================================================
// Banco Cordillera abre cuentas de ahorros. Todo empieza por el
// titular: la persona dueña de la cuenta.
//
// Construye la clase Titular:
//   - Tres campos privados: nombre (String), documento (String)
//     y celular (String).
//   - Un constructor público Titular(String nombre, String documento).
//     El celular NO va en el constructor: se registra después.
//   - Reglas del constructor:
//       · nombre null o en blanco     → IllegalArgumentException
//       · documento null o en blanco  → IllegalArgumentException
//   - Tres getters: getNombre(), getDocumento() y getCelular().
//   - Un setter setCelular(String celular). Un celular colombiano
//     tiene 10 dígitos y empieza por 3. Si es null, no tiene 10
//     caracteres o no empieza por "3" → IllegalArgumentException
//     y el celular anterior NO cambia.
//   - El nombre y el documento NO tienen setter.
//
// Ejemplos:
//   Titular laura = new Titular("Laura Pérez", "1032456789");
//   laura.getNombre()                → "Laura Pérez"
//   laura.getCelular()               → null  (nadie le ha dado valor)
//   laura.setCelular("3104567890")   → se guarda
//   laura.setCelular("6014567890")   → IllegalArgumentException (es un fijo)
//   new Titular("   ", "1032456789") → IllegalArgumentException
//
// Pistas:
//   - Revisa null ANTES de usar isBlank() o length().
//   - texto.length() da la cantidad de caracteres.
//   - texto.startsWith("3") da true si el texto empieza por "3".
// ============================================================

public class Titular {

    private String nombre;
    private String documento;
    private String celular;

    public Titular(String nombre, String documento) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre no puede estar vacío");
        }
        if (documento == null || documento.isBlank()) {
            throw new IllegalArgumentException("El documento no puede estar vacío");
        }
        this.nombre = nombre;
        this.documento = documento;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDocumento() {
        return documento;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        if (celular == null || celular.length() != 10 || !celular.startsWith("3")) {
            throw new IllegalArgumentException("El celular debe tener 10 dígitos y empezar por 3");
        }
        this.celular = celular;
    }

}
