# 🏦 Banco Cordillera · Lab Mj3

**Generation Colombia · TIFC2DEV-JAVA · Cohorte 15**

---

## ¿Qué es esto?

### El negocio

Banco Cordillera abre cuentas de ahorros, vende CDT y tiene cajeros automáticos.
Vas a construir sus **clases**: el titular, la cuenta, el CDT, las tarifas y el cajero.
Aquí practicas todo lo de Mj2 (clases, objetos, constructor, `this`, `private`) y Mj1 (getters y setters, métodos, sobrecarga, `static`, excepciones).

### Tu nota se calcula sola

Cada vez que subes tu código a GitHub, un robot compila tus clases, crea objetos con ellas y revisa que se comporten como pide el enunciado.
En unos minutos ves tu nota (de 0.0 a 5.0) en tu Pull Request.
Puedes corregir y volver a subir todas las veces que quieras: la nota se actualiza sola.

### ¿Qué es un test?

**Definición técnica:** un test es un programa que ejecuta tu código con datos conocidos y compara el resultado con el resultado correcto.

**En la vida real:** es como la recepcionista que verifica tu carné antes de dejarte entrar. No le importa cómo lo hiciste: le importa que diga lo que tiene que decir.

### Los tests de estructura

Algunos tests revisan **cómo** está hecha tu clase: que los campos sean `private`, que no exista `setSaldo`, que las constantes sean `public static final` o que `validarDias` sea `private`.
Si tu clase funciona pero no está hecha como pide el enunciado, ese test no pasa.

---

## Los 5 ejercicios

Cada archivo trae el enunciado **arriba, en los comentarios**. Léelo completo antes de escribir código.

| # | Tema | Archivo | Qué construyes |
|---|---|---|---|
| 01 | Constructor y setter | `ejercicios/Titular.java` | Validaciones, getters y un setter con regla |
| 02 | Métodos y estado | `ejercicios/CuentaAhorros.java` | `depositar`, `retirar` y un contador `static` |
| 03 | Retorno y sobrecarga | `ejercicios/Cdt.java` | Intereses, constantes y un método `private` |
| 04 | `static` y constantes | `ejercicios/Tarifas.java` | Una clase solo con métodos `static` |
| 05 | Integrador | `ejercicios/Cajero.java` | `try/catch`: el cajero nunca se cae |

Hazlos en orden: el 02 usa el 01, y el 05 usa el 01, el 02 y el 04.

### Aquí no se usa Scanner ni main

Tus clases no piden nada por teclado ni tienen `main`. Los tests crean los objetos con los datos que necesitan.
Si quieres ver tus clases funcionando, usa `ejercicios/PruebaBanco.java` (ese archivo **no** se califica).

---

## Paso 1 · Fork

### ¿Qué es un fork?

**Definición técnica:** un fork es una copia de un repositorio ajeno dentro de tu propia cuenta de GitHub.

**En la vida real:** es como fotocopiar el cuaderno de la profe. Escribes en tu copia; el original no cambia.

### Cómo hacerlo

1. Abre el enlace del repositorio que te compartió la profe.
2. Arriba a la derecha, clic en **Fork**.
3. Deja el nombre como está y clic en **Create fork**.

### ¿Quedó bien?

Arriba a la izquierda debe decir **tu-usuario / Lab_BancoJavaMj3_CH15**, y debajo, en letra pequeña, *forked from* la cuenta de la profe.

---

## Paso 2 · Clone

### Copia la URL de TU fork

En tu fork (no en el de la profe): botón verde **Code** → pestaña **HTTPS** → copia la URL.

### Descárgalo a tu computador

Abre **Git Bash** (o la terminal que uses) en la carpeta donde guardas tus proyectos y escribe:

```bash
git clone URL-DE-TU-FORK
cd Lab_BancoJavaMj3_CH15
```

### Ábrelo en IntelliJ IDEA

**File → Open** → elige la carpeta `Lab_BancoJavaMj3_CH15` → **Open**.

### Prepara la carpeta de ejercicios (una sola vez)

Para que IntelliJ reconozca tus clases y te deje ejecutar `PruebaBanco`:

1. En el panel izquierdo, clic derecho sobre la carpeta `ejercicios`.
2. **Mark Directory as → Sources Root**. La carpeta se pone azul.
3. Si IntelliJ muestra arriba *Project JDK is not defined*, clic en **Setup SDK** y elige el JDK 25.

---

## Paso 3 · Resolver

### Dónde escribir

Cada archivo trae el enunciado arriba y una clase vacía con `// Tu código aquí`. Dentro de las llaves de la clase van tus campos, tu constructor y tus métodos.

### Las tres reglas de oro

1. **No le cambies el nombre** al archivo ni a la clase.
2. **No le agregues una línea `package`** arriba: las clases van sin paquete.
3. **Respeta los nombres y los tipos del enunciado**: si pide `getSaldo()` y un `long`, escribe exactamente eso. El test busca tus métodos por su nombre.

### La forma de una clase (ejemplo que NO resuelve ningún ejercicio)

Así se ve una clase con un campo, un constructor que valida y su getter. Es de otro negocio, solo para que recuerdes la forma:

```java
public class Casillero {

    private int numero;

    public Casillero(int numero) {
        if (numero < 1) {
            throw new IllegalArgumentException("El casillero empieza en 1. Llegó: " + numero);
        }
        this.numero = numero;
    }

    public int getNumero() {
        return numero;
    }
}
```

### Cómo probar tus clases a mano

Abre `ejercicios/PruebaBanco.java`, quita las `//` de las líneas de la clase que ya terminaste y dale al ▶ verde junto al `main`.

---

## Paso 4 · Probar tu nota en tu computador

### Todos los ejercicios

En la terminal de IntelliJ (**View → Tool Windows → Terminal**), dentro de la carpeta del proyecto:

```bash
npm test
```

La primera vez tarda unos segundos más (compila todo). Las siguientes son más rápidas.

### Un solo ejercicio

```bash
npm test -- 03
```

### Cómo se lee el resultado

| Símbolo | Significa |
|---|---|
| ✅ | Todos los tests de ese ejercicio pasan |
| 🟡 | Algunos pasan |
| ❌ | Ninguno pasa todavía |

Debajo de cada 🟡 o ❌ aparece qué test falló y una pista (→). Al final ves tu nota.

---

## Paso 5 · Subir tus cambios

### Los tres comandos

```bash
git add .
git commit -m "Resuelvo ejercicios 01 a 03"
git push
```

### Qué hace cada uno

Piensa en una caja que vas a enviar:

- `git add .` → metes los archivos en la caja.
- `git commit -m "..."` → cierras la caja y le pones una etiqueta que dice qué lleva.
- `git push` → envías la caja a tu fork en GitHub.

---

## Paso 6 · Pull Request (solo UNO)

### ¿Qué es un Pull Request?

**Definición técnica:** un Pull Request (PR) es una solicitud para que los cambios de tu fork se revisen en el repositorio original.

**En la vida real:** es como radicar un documento en una oficina. Lo entregas una vez y queda un número de radicado para hacerle seguimiento.

### Cómo abrirlo

1. Entra a tu fork en GitHub.
2. Clic en **Contribute → Open pull request**.
3. Revisa que arriba diga: repositorio de la profe ← tu fork.
4. **Título: tu nombre completo.** Así la profe sabe de quién es.
5. Clic en **Create pull request**.

### Abre uno solo

Después de abrirlo, cada `git push` que hagas se suma solo a ese mismo PR. No abras otro.

---

## Paso 7 · Ver tu nota

### Dónde aparece

En unos minutos, dentro de tu PR aparece un comentario con tu nota y una tabla por ejercicio.
En la lista de Pull Requests también se ve una etiqueta de color, por ejemplo `Nota 3.5`.

### Qué te falta

En el comentario, clic en **🔎 Ver qué falta por corregir**. Ahí está cada test que falló con su pista.

### Cómo subir la nota

Corrige en tu computador, prueba con `npm test` y haz `git add`, `git commit` y `git push`.
La nota del PR se actualiza sola.

### Ojo con la fecha límite

Este taller **no tiene fecha límite** por ahora. Si la profe pone una, después de esa fecha los `push` ya no cambian la nota, y una primera entrega tardía queda con la etiqueta `⏰ Fuera de plazo`.

---

## Archivos que NO debes modificar

- La carpeta `tests/`
- La carpeta `scripts/`
- La carpeta `.github/`
- El archivo `package.json`

### ¿Y si los modifico?

Tu nota se calcula igual, con los tests originales de la profe.
Pero tu PR queda marcado con `⚠️ Revisar` y la profe lo revisa a mano.

---

## Errores frecuentes

### «npm no se reconoce como un comando»

No tienes Node.js instalado o la terminal no lo encuentra. Instala la versión LTS desde nodejs.org y **cierra y vuelve a abrir** la terminal.

### «No encuentro Java (javac) en tu computador»

Java está instalado, pero la terminal no lo encuentra. Escribe `javac -version`:
si no responde, reinstala el JDK de Adoptium y en el instalador activa **Add to PATH** y **Set JAVA_HOME variable**.
Después cierra y vuelve a abrir la terminal (y IntelliJ).

### «Falta el constructor público Titular(String, String)»

Tu clase todavía no tiene ese constructor, o lo tiene con otros tipos o en otro orden. Compara con el enunciado: los tipos y el orden de los parámetros deben ser exactamente esos.
Si el enunciado dice `long` y escribiste `int`, el test no lo encuentra.

### «Falta el método público getSaldo()…»

El test busca el método por su nombre exacto. Revisa mayúsculas y minúsculas, y que sea `public`.

### «esperaba Laura Pérez / 1032456789 y obtuve null / null»

El objeto se creó, pero el dato nunca llegó al campo. Casi siempre es el `this` que falta: `nombre = nombre;` copia el parámetro sobre sí mismo. Escribe `this.nombre = nombre;`.

### «…debería lanzar IllegalArgumentException, pero no lanzó ninguna excepción»

Falta la validación, o el límite está mal (`<` donde iba `<=`). Lee la pista entre paréntesis.

### «…lanzó NullPointerException y debería lanzar IllegalArgumentException»

Usaste `documento.isBlank()` antes de revisar si `documento` es `null`. Pon primero `documento == null ||` y después `documento.isBlank()`.

### «El campo nombre debería ser private»

Es un test de estructura: todos los campos de la clase van `private`.

### «No debería existir el método setSaldo»

Es un test de estructura: el saldo solo cambia con `depositar` y `retirar`.

### «…debería ser static: no necesita ningún objeto»

Los métodos de `Tarifas` y `Cajero` llevan `static`: se llaman con el nombre de la clase, como `Tarifas.costoRetiro(true)`.

### «Falta la constante…» o «…debería ser public static final»

Las constantes se declaran así: `public static final long CUOTA_MANEJO = 12_900;`. El nombre va en MAYÚSCULAS, exactamente como en el enunciado.

### «Falta el método private validarDias…»

El 03 pide un método `private` para no repetir la regla de los días. Escríbelo y úsalo en el constructor y en `calcularIntereses(int)`.

### «…esperaba IllegalArgumentException: El monto debe ser… y obtuve NumberFormatException…»

En `leerMonto`, falta el `try/catch` alrededor de `Long.parseLong`. Atrapa `NumberFormatException` y lanza `IllegalArgumentException` con el mensaje del enunciado.

### «Tu código no compila (Cdt.java, línea N): …»

Java ni siquiera pudo crear tu clase. El mensaje dice el archivo, la línea y la causa (un `;` que falta, una llave…). IntelliJ también la marca en rojo.
Si el error está en `Titular.java`, tampoco compilan el 02 y el 05, porque usan esa clase. Lo mismo pasa con `CuentaAhorros.java` y `Tarifas.java` frente al 05.

### «No encuentro la clase Titular»

Le cambiaste el nombre a la clase o le agregaste una línea `package` arriba. Déjala como venía.

### «Tiempo agotado: tu código no termina»

Hay un ciclo que nunca se detiene dentro de tu clase. En este lab no hace falta ningún ciclo.

### «Please tell me who you are»

Git no sabe quién eres. Escribe estos dos comandos (con tus datos) y repite el `commit`:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
```

### Error 403 al hacer `git push`

Clonaste el repositorio de la profe en vez de tu fork. Vuelve al Paso 2 y clona la URL de **tu** fork.

---

<sub>© 2026 Ana Alvarado · Educadora Tech & Desarrolladora Full Stack · Todos los derechos reservados · linkedin.com/in/ana-alvarado-instructora-full-stack</sub>
