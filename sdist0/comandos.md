# Comandos para levantar y probar sdist0

Ajustar `felix` y los puertos según cómo se llegue a la VM. La VM solo necesita Docker.

## 1. En el host: generar los certificados

```bash
cd ~/dev/sd-demo
./sdist0/gen-certs.sh        # crea la CA y el certificado (ya trae las IPs)
```

Si el script no tiene permiso de ejecución: `bash sdist0/gen-certs.sh`.

## 2. En el host: enviar los archivos a sdist0

No se envía `ca.key` (clave privada de la CA): se queda en el host.

```bash
ssh -p 2222 felix@127.0.0.1 'mkdir -p ~/sd-demo/sdist0/certs'
scp -P 2222 docker-compose.sdist0.yml felix@127.0.0.1:~/sd-demo/
scp -P 2222 sdist0/dynamic.yml sdist0/index.html felix@127.0.0.1:~/sd-demo/sdist0/
scp -P 2222 sdist0/certs/server.crt sdist0/certs/server.key sdist0/certs/ca.crt felix@127.0.0.1:~/sd-demo/sdist0/certs/
```

## 3. En sdist0: levantar Traefik

```bash
cd ~/sd-demo
docker compose -f docker-compose.sdist0.yml up -d
docker compose -f docker-compose.sdist0.yml ps                   # traefik y prueba en "running"
curl --cacert sdist0/certs/ca.crt https://localhost/             # debe mostrar <h1>sdist0</h1>
```

## 4. En el host: confiar en la CA e instalarla

`sdist0/certs/ca.crt` ya está en el host. Instalarla en el navegador, marcando la opción de confiar para sitios web:

- Chrome: `chrome://settings/certificates` → Autoridades → Importar.
- Firefox: `about:preferences#privacy` → Ver certificados → Autoridades → Importar.

Para un front Next.js, arrancarlo con `NODE_EXTRA_CA_CERTS=/ruta/a/sdist0/certs/ca.crt` (las llamadas desde el servidor no usan el almacén del navegador).

## 5. En el host: probar

Opción A, si se llega a la IP NAT:

```bash
curl --cacert sdist0/certs/ca.crt https://10.0.10.15/
```

Opción B, con túnel SSH (dejar esta terminal abierta):

```bash
ssh -p 2222 -L 8443:localhost:443 -L 9443:localhost:8443 felix@127.0.0.1
```

En otra terminal:

```bash
curl --cacert sdist0/certs/ca.crt https://localhost:8443/                # público -> 200
curl --cacert sdist0/certs/ca.crt -X POST https://localhost:8443/        # público -> 404
curl --cacert sdist0/certs/ca.crt -X POST https://localhost:9443/        # privado -> 405
curl --cacert sdist0/certs/ca.crt https://localhost:9443/dashboard/      # dashboard -> 200
```

## Volver a empezar

Si cambia una IP, en el host repetir los pasos 1 y 2 (solo los `scp` de los certificados) y en sdist0:

```bash
docker compose -f docker-compose.sdist0.yml restart traefik
```

La CA se regenera cada vez, así que hay que repetir el paso 4.

## Si algo falla

- `no alternative certificate subject name matches`: se entró por un nombre o IP que no está en el certificado. Agregarlo (`./sdist0/gen-certs.sh IP:x.x.x.x`), reenviar los certificados y reiniciar Traefik.
- `certificate signed by unknown authority`: falta `--cacert` o instalar la CA.
- Conexión rechazada o timeout: el puerto no llega a la VM. Revisar el reenvío o usar el túnel.
- `404` en todo: Traefik no cargó `dynamic.yml`. Ver `docker compose -f docker-compose.sdist0.yml logs traefik`.
