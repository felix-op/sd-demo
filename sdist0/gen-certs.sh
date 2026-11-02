#!/usr/bin/env bash
# Genera una CA propia y un certificado para Traefik en sdist0/certs/.
# Uso: ./sdist0/gen-certs.sh [SAN extra, ej: IP:192.168.1.10 DNS:sdist0.lan]
set -euo pipefail

dir="$(cd "$(dirname "$0")" && pwd)/certs"
mkdir -p "$dir"
cd "$dir"

# localhost/túnel, sdist0 (NAT 10.0.10.15, interna 10.0.2.1) y las otras máquinas de la demo
san="DNS:localhost,DNS:sdist0,IP:127.0.0.1,IP:10.0.10.15,IP:10.0.2.1,IP:10.0.2.15"
san="$san,IP:10.0.3.1,IP:10.0.3.2,IP:10.0.3.3"
for extra in "$@"; do san="$san,$extra"; done

# CA (se instala en los clientes para que confíen en el certificado)
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout ca.key -out ca.crt -subj "/CN=sdist CA"

# Certificado del servidor firmado por la CA
openssl req -newkey rsa:2048 -nodes -keyout server.key -out server.csr -subj "/CN=sdist0"
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 825 \
  -extfile <(printf "subjectAltName=%s\nextendedKeyUsage=serverAuth" "$san") -out server.crt
rm -f server.csr ca.srl

echo "Listo. Confiar en $dir/ca.crt en los clientes. SAN: $san"
