# Comandos Centralizados de Despliegue

Este documento centraliza los comandos necesarios para empaquetar, publicar en Docker Hub y desplegar los servicios en el laboratorio de máquinas virtuales.

> [!NOTE]
> **Certificados TLS**: La generación de certificados con la CA propia y su instalación en el navegador ya están detalladas en [sdist0/comandos.md](file:///home/oscar/IdeaProjects/demo/sdist0/comandos.md). Si ya los instalaste, no hace falta repetir ese paso.

---

## 1. Compilar y Subir Imágenes a Docker Hub (Host)

### Monolito
```bash
cd monolito/
./mvnw package -DskipTests
docker build -f src/main/docker/Dockerfile.jvm -t felixop/sdmonolito:latest .
docker push felixop/sdmonolito:latest
cd ..
```

### Microservicio: Personas
```bash
cd personas/
./mvnw package -DskipTests
docker build -t felixop/sdpersonas:latest .
docker push felixop/sdpersonas:latest
cd ..
```

### Microservicio: Libros y Préstamos
```bash
cd libros-prestamos/
./mvnw package -DskipTests
docker build -t felixop/sdlibros-prestamos:latest .
docker push felixop/sdlibros-prestamos:latest
cd ..
```

---

## 2. Despliegue en `sdist1` (Servicio Personas)

### 2.1 Enviar el Docker Compose a `sdist1` (vía `sdist0`)
Desde la raíz del proyecto en el host:
```bash
# Copiar el compose al gateway sdist0
scp -P 2222 docker-compose.sdist1.yml felix@localhost:/tmp/docker-compose.yml

# Moverlo desde sdist0 hacia sdist1 (10.0.3.2) y limpiar /tmp
ssh -p 2222 felix@localhost 'scp /tmp/docker-compose.yml felix@10.0.3.2:~/docker-compose.yml && rm /tmp/docker-compose.yml'
```

### 2.2 Conectarse a `sdist1` y Levantar
```bash
# Entrar a sdist0 y saltar a sdist1
ssh -p 2222 felix@localhost
ssh felix@10.0.3.2

# Descargar las imágenes actualizadas y arrancar
docker compose pull
docker compose up -d

# Verificar estado de los contenedores
docker compose ps
```

---

## 3. Actualizar Enrutamiento en `sdist0` (Traefik)

Traefik monitorea cambios en caliente (`watch: true`), por lo que no es necesario reiniciar el contenedor al modificar rutas:

```bash
# Enviar dynamic.yml actualizado a sdist0
scp -P 2222 sdist0/dynamic.yml felix@localhost:~/sd-demo/sdist0/dynamic.yml
```

---

## 4. Verificación desde el Navegador

Una vez levantado `sdist1` y actualizado `dynamic.yml`, se puede comprobar directamente desde el navegador en el host:

- **Monolito**: `https://localhost:8443/monolito/`
- **Microservicio Personas (Alumnos)**: `https://localhost:8443/microservicios/alumnos`
- **Microservicio Personas (Usuarios)**: `https://localhost:8443/microservicios/usuarios`
- **Dashboard de Traefik**: `https://localhost:8443/dashboard/`
