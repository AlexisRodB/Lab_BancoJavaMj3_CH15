// Ayuda de los tests (no la modifiques): crea objetos y llama métodos de tus clases
// "por reflexión", es decir, buscándolos por su nombre mientras el programa corre.
// Así, si te falta un método, el test no se rompe: te dice exactamente qué falta.

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;

public class Sonda {

    static class Falta extends RuntimeException {
        Falta(String mensaje) {
            super(mensaje);
        }
    }

    public static void chequear(String id, Callable<Object> chequeo) {
        String linea;
        try {
            Object valor = chequeo.call();
            linea = "OK|" + texto(valor);
        } catch (Falta f) {
            linea = "FALTA|" + f.getMessage();
        } catch (Throwable t) {
            linea = "EXC|" + t.getClass().getSimpleName() + "|" + (t.getMessage() == null ? "" : t.getMessage());
        }
        System.out.println("##" + id + "|" + linea.replace("\r", " ").replace("\n", " "));
    }

    static String texto(Object valor) {
        if (valor == null) return "null";
        return String.valueOf(valor);
    }

    static Class<?> clase(String nombre) {
        try {
            return Class.forName(nombre);
        } catch (ClassNotFoundException e) {
            throw new Falta("No encuentro la clase " + nombre + " (¿le cambiaste el nombre o le agregaste una línea package?)");
        }
    }

    static boolean acepta(Class<?> parametro, Object argumento) {
        if (argumento == null) return !parametro.isPrimitive();
        Class<?> a = argumento.getClass();
        if (parametro.isAssignableFrom(a)) return true;
        if (a == Integer.class) return parametro == int.class || parametro == long.class || parametro == double.class;
        if (a == Long.class) return parametro == long.class || parametro == double.class;
        if (a == Double.class) return parametro == double.class;
        if (a == Boolean.class) return parametro == boolean.class;
        if (a == Character.class) return parametro == char.class;
        return false;
    }

    static boolean coinciden(Class<?>[] parametros, Object[] argumentos) {
        if (parametros.length != argumentos.length) return false;
        for (int i = 0; i < parametros.length; i++) {
            if (!acepta(parametros[i], argumentos[i])) return false;
        }
        return true;
    }

    static String firma(String nombre, Object[] argumentos) {
        List<String> tipos = new ArrayList<>();
        for (Object a : argumentos) {
            if (a == null) tipos.add("…");
            else if (a instanceof Integer) tipos.add("int");
            else if (a instanceof Long) tipos.add("long");
            else if (a instanceof Double) tipos.add("double");
            else if (a instanceof Boolean) tipos.add("boolean");
            else tipos.add(a.getClass().getSimpleName());
        }
        return nombre + "(" + String.join(", ", tipos) + ")";
    }

    static Object desenvolver(InvocationTargetException e) throws Exception {
        Throwable causa = e.getCause();
        if (causa instanceof Exception) throw (Exception) causa;
        if (causa instanceof Error) throw (Error) causa;
        throw e;
    }

    public static Object nuevo(String nombreClase, Object... argumentos) throws Exception {
        Class<?> c = clase(nombreClase);
        for (Constructor<?> k : c.getConstructors()) {
            if (coinciden(k.getParameterTypes(), argumentos)) {
                try {
                    return k.newInstance(argumentos);
                } catch (InvocationTargetException e) {
                    return desenvolver(e);
                }
            }
        }
        throw new Falta("Falta el constructor público " + firma(nombreClase, argumentos));
    }

    public static Object llamar(Object objeto, String metodo, Object... argumentos) throws Exception {
        Class<?> c = objeto.getClass();
        for (Method m : c.getMethods()) {
            if (m.getName().equals(metodo) && coinciden(m.getParameterTypes(), argumentos)) {
                try {
                    return m.invoke(objeto, argumentos);
                } catch (InvocationTargetException e) {
                    return desenvolver(e);
                }
            }
        }
        throw new Falta("Falta el método público " + firma(metodo, argumentos) + " en la clase " + c.getSimpleName());
    }

    static List<Field> camposDeInstancia(Class<?> c) {
        List<Field> campos = new ArrayList<>();
        for (Field f : c.getDeclaredFields()) {
            if (!Modifier.isStatic(f.getModifiers()) && !f.isSynthetic()) campos.add(f);
        }
        return campos;
    }

    public static String camposPrivados(String nombreClase, int minimo) {
        List<Field> campos = camposDeInstancia(clase(nombreClase));
        if (campos.size() < minimo) {
            return "La clase " + nombreClase + " debería tener al menos " + minimo + " campos (encontré " + campos.size() + ")";
        }
        for (Field f : campos) {
            if (!Modifier.isPrivate(f.getModifiers())) {
                return "El campo " + f.getName() + " debería ser private";
            }
        }
        return "OK";
    }

    public static String sinConstructorVacio(String nombreClase) {
        for (Constructor<?> k : clase(nombreClase).getConstructors()) {
            if (k.getParameterCount() == 0) {
                return "Existe un constructor sin datos: con él se podría crear un " + nombreClase + " vacío";
            }
        }
        return "OK";
    }

    public static String sinMetodo(String nombreClase, String metodo) {
        for (Method m : clase(nombreClase).getMethods()) {
            if (m.getName().equals(metodo)) {
                return "No debería existir el método " + metodo + ": ese dato no se puede cambiar después de crear el objeto";
            }
        }
        return "OK";
    }

    public static String tieneMetodo(String nombreClase, String metodo) {
        for (Method m : clase(nombreClase).getMethods()) {
            if (m.getName().equals(metodo)) return "OK";
        }
        return "Falta el método público " + metodo + " en la clase " + nombreClase;
    }

    public static String campoDeTipo(String nombreClase, String tipo) {
        for (Field f : camposDeInstancia(clase(nombreClase))) {
            if (f.getType().getSimpleName().equals(tipo)) return "OK";
        }
        return "La clase " + nombreClase + " debería tener un campo de tipo " + tipo;
    }
    public static Object estatico(String nombreClase, String metodo, Object... argumentos) throws Exception {
        Class<?> c = clase(nombreClase);
        for (Method m : c.getMethods()) {
            if (m.getName().equals(metodo) && coinciden(m.getParameterTypes(), argumentos)) {
                if (!Modifier.isStatic(m.getModifiers())) {
                    throw new Falta("El método " + firma(metodo, argumentos) + " de " + nombreClase + " debería ser static: no necesita ningún objeto");
                }
                try {
                    return m.invoke(null, argumentos);
                } catch (InvocationTargetException e) {
                    return desenvolver(e);
                }
            }
        }
        throw new Falta("Falta el método público static " + firma(metodo, argumentos) + " en la clase " + nombreClase);
    }

    public static String constante(String nombreClase, String nombre, Object esperado) throws Exception {
        Field f;
        try {
            f = clase(nombreClase).getDeclaredField(nombre);
        } catch (NoSuchFieldException e) {
            return "Falta la constante " + nombre + " en la clase " + nombreClase;
        }
        int m = f.getModifiers();
        if (!Modifier.isPublic(m) || !Modifier.isStatic(m) || !Modifier.isFinal(m)) {
            return "La constante " + nombre + " debería ser public static final";
        }
        Object valor = f.get(null);
        if (!String.valueOf(valor).equals(String.valueOf(esperado))) {
            return "La constante " + nombre + " debería valer " + esperado + " (vale " + valor + ")";
        }
        return "OK";
    }

    public static String metodoPrivado(String nombreClase, String nombre, String paraQue) {
        for (Method m : clase(nombreClase).getDeclaredMethods()) {
            if (m.getName().equals(nombre)) {
                if (Modifier.isPrivate(m.getModifiers())) return "OK";
                return "El método " + nombre + " debería ser private: es ayuda interna de la clase";
            }
        }
        return "Falta el método private " + nombre + " en la clase " + nombreClase + " (" + paraQue + ")";
    }

    public static String campoEstatico(String nombreClase, String nombre) {
        try {
            Field f = clase(nombreClase).getDeclaredField(nombre);
            int m = f.getModifiers();
            if (!Modifier.isStatic(m)) return "El campo " + nombre + " debería ser static: es de la clase, no de cada cuenta";
            if (!Modifier.isPrivate(m)) return "El campo " + nombre + " debería ser private";
            return "OK";
        } catch (NoSuchFieldException e) {
            return "Falta el campo private static " + nombre + " en la clase " + nombreClase;
        }
    }
}
