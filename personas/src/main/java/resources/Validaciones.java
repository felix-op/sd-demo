package resources;

final class Validaciones {

    // Largo por defecto de las columnas String de Hibernate (varchar(255))
    static final int MAX_VARCHAR = 255;

    private Validaciones() {
    }

    /**
     * Recibe pares nombre, valor y devuelve el detalle del primer campo que supera el largo
     * máximo de la columna, o null si todos entran.
     */
    static String primerExceso(String... nombresYValores) {
        for (int i = 0; i < nombresYValores.length; i += 2) {
            var valor = nombresYValores[i + 1];
            if (valor != null && valor.length() > MAX_VARCHAR) {
                return "El campo '" + nombresYValores[i] + "' supera el máximo de " + MAX_VARCHAR
                        + " caracteres (se recibieron " + valor.length() + ")";
            }
        }
        return null;
    }
}
