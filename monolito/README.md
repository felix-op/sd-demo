# demo

Proyecto Quarkus con Hibernate ORM Panache + PostgreSQL.

## Configuracion inicial

Copiar el archivo de variables de entorno y completar los valores (nunca se commitea `.env`):

```shell script
cp .env.example .env
```

## Desarrollo

La base de datos de desarrollo es un Postgres persistente levantado por Docker Compose (no se usa Dev Services de Quarkus).

```shell script
# Levantar solo la base de datos
docker compose -f docker-compose.dev.yml up -d db

# Correr la app en modo dev (live coding)
./mvnw quarkus:dev
```

> **_NOTE:_** Dev UI disponible solo en modo dev en <http://localhost:8080/q/dev/>.

Para probar el build empaquetado (jar real, sin hot-reload) contra la misma base:

```shell script
./mvnw package
docker compose -f docker-compose.dev.yml up -d --build app
```

## Backup de la base de datos (dev)

Generar un backup (`.sql` plano) de la base de desarrollo:

```shell script
set -a; source .env; set +a
docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" demo-db-1 pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges > backups/dev.sql
```

Restaurarlo sobre la base (sobreescribe los datos actuales):

```shell script
set -a; source .env; set +a
cat backups/dev.sql | docker exec -i -e PGPASSWORD="$POSTGRES_PASSWORD" demo-db-1 psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

`backups/` está en `.gitignore` (puede contener datos reales), así que estos dumps no se versionan.

## Empaquetado

```shell script
./mvnw package
```

Genera `target/quarkus-app/quarkus-run.jar` (no es uber-jar, las dependencias quedan en `target/quarkus-app/lib/`). Se corre con:

```shell script
java -jar target/quarkus-app/quarkus-run.jar
```

Para generar un uber-jar o un ejecutable nativo, ver la [guia de Quarkus](https://quarkus.io/guides/maven-tooling).

## Produccion

```shell script
./mvnw package
docker compose -f docker-compose.production.yml up -d --build
```

Las credenciales de base de datos se inyectan via variables de entorno (`.env` en el servidor), nunca quedan hardcodeadas en `application.properties`.

## Guias relacionadas

- [REST Jackson](https://quarkus.io/guides/rest#json-serialisation)
- [Hibernate ORM with Panache](https://quarkus.io/guides/hibernate-orm-panache)
- [JDBC Driver - PostgreSQL](https://quarkus.io/guides/datasource)
