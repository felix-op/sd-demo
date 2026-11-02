# Cosas para mejorar

Decisiones tomadas a propósito para simplificar la demo. Nada de esto es adecuado para producción.

## Seguridad

- **Backoffice y dashboard accesibles desde afuera.** Los puertos de Traefik están publicados en todas las interfaces, así que `:8443` (privado) y `/dashboard` también se ven desde el lado NAT. Atar `:8443` a la IP de la red interna (`"10.0.2.1:8443:8443"`).
- **Dashboard de Traefik sin autenticación.** Agregarle basic auth o limitarlo por IP.
- **Los endpoints del backoffice no tienen autenticación.** La separación público/privado depende solo del enrutamiento de Traefik. Si algo llega al servicio sin pasar por Traefik, puede hacer cualquier cosa. Agregar autenticación (por ejemplo OIDC/JWT) en los servicios.
- **CORS con `origins=*`** en todos los servicios. Restringirlo al origen real del front.
- **Credenciales de base fijas (`demo`/`demo`)** en `application.properties` y en los compose. Pasarlas a variables de entorno o secretos.
- **Certificados de una CA propia** (`sdist0/gen-certs.sh`). Con un dominio real, usar Let's Encrypt (ACME) y evitar instalar la CA en cada cliente.
- **TLS solo hasta el gateway.** Entre Traefik y los servicios el tráfico va en HTTP plano.

## Datos y consistencia

- **Condición de carrera en `createPrestamo`.** Consulta si el libro está prestado y después inserta, sin bloqueo ni restricción. Con más de una instancia escribiendo puede prestar el mismo libro dos veces. Agregar un índice único parcial (un préstamo activo por libro) o un bloqueo pesimista.
- **Integridad entre servicios.** En `personas` se puede borrar un alumno o usuario que tiene préstamos, porque ya no hay clave foránea entre bases. `libros-prestamos` tiene que tolerar que no existan, o `personas` tiene que consultarlo antes de borrar.
- **`informes` debe tener su propia copia de los datos** (copia propia o réplica de lectura de Postgres). Si lee la base de `libros-prestamos`, un informe pesado también la satura.
- **Largo máximo de los campos fijado en 255** (`Validaciones.MAX_VARCHAR`), copiando el valor por defecto de Hibernate. Si se agrega `@Column(length=...)` hay que actualizarlo.

## API

- **`GET /libros` hace una consulta por libro** para armar `alumnosConPrestamo` (N+1) y devuelve todo el catálogo sin paginar. `GET /catalogo` ya resuelve esto con una sola consulta.
- **El campo `instace` del error RFC 7807 tiene un error de tipeo** (`Rfc7807DTO`). Debería ser `instance`. Corregirlo cuando se confirme que el front no lo usa.
- **`PrestamoRepository.findActiveByStudent` está sin uso** desde que el alumno dejó de devolver `librosPrestados`.
- **El informe sigue siendo pesado a propósito** (`InformeService` hace `listAll()` y filtra en memoria). Es lo que muestra el escenario de la caída; en producción habría que filtrar y paginar en la consulta.

## Infraestructura

- **Traefik sin `healthCheck`** en los `loadBalancer`. Agregarlos para sacar de rotación una instancia caída.
- **Sin límites de recursos** (`mem_limit`, `cpus`) en los contenedores. Un informe pesado en sdist2 puede arrastrar a `libros-prestamos`, que comparte máquina.
- **El `docker-compose.yml` de la raíz** (solo `personas`) quedó de la etapa anterior. Reemplazarlo por `docker-compose.sdist1.yml` y `docker-compose.sdist2.yml`.
