En monolito/

scp -P 2222 docker-compose.dev.yml felix@localhost:/tmp/docker-compose.yml

scp /tmp/docker-compose.yml felix@10.0.3.2:/home/felix/ && rm /tmp/docker-compose.yml

docker build -f src/main/docker/Dockerfile.jvm -t felixop/sdmonolito:latest .

En sdist1:

docker compose up -d
docker compose ps
curl -i http://localhost:8080/