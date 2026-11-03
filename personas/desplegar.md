# Despliegue del Microservicio Personas en sdist1

## 1. En el Host: Compilar y generar la imagen Docker

```bash
cd personas/

# Compilar y empaquetar Quarkus
./mvnw package -DskipTests

# Construir la imagen Docker
docker build -t felixop/sdpersonas:latest .

# Subir la imagen a Docker Hub
docker push felixop/sdpersonas:latest
```

## 2. En el Host: Enviar el docker-compose a sdist1 pasando por sdist0

```bash
# Copiar docker-compose.sdist1.yml a sdist0 (puerto 2222)
scp -P 2222 docker-compose.sdist1.yml felix@localhost:/tmp/docker-compose.yml

# Desde sdist0 moverlo a sdist1 (10.0.3.2) y limpiar /tmp
ssh -p 2222 felix@localhost 'scp /tmp/docker-compose.yml felix@10.0.3.2:~/docker-compose.yml && rm /tmp/docker-compose.yml'
```

## 3. En sdist1: Descargar y levantar el servicio

```bash
# Conectarse a sdist1 (vía túnel sdist0):
ssh -p 2222 felix@localhost
ssh felix@10.0.3.2

# En sdist1:
docker compose pull
docker compose up -d
docker compose ps

# Verificar funcionamiento local en sdist1
curl -i http://localhost:8100/alumnos
```

## 4. En el Host: Actualizar la configuración de Traefik en sdist0

Copiar el archivo `sdist0/dynamic.yml` actualizado:
```bash
scp -P 2222 sdist0/dynamic.yml felix@localhost:~/sd-demo/sdist0/dynamic.yml
```
Traefik detecta y aplica los cambios automáticamente en caliente (`watch: true`).

## 5. En el Host: Probar a través de Traefik (TLS)

```bash
# Consultar alumnos vía prefijo /microservicios/:
curl --cacert sdist0/certs/ca.crt https://localhost:8443/microservicios/alumnos

# Consultar usuarios vía prefijo /microservicios/:
curl --cacert sdist0/certs/ca.crt https://localhost:8443/microservicios/usuarios
```
