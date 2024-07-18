set -x
docker-compose build --progress=plain && \
docker compose --file 'docker-compose.yaml' --project-name 'django' down && \
docker compose -f docker-compose.yaml up -d

images=$(docker images | grep none | tr -s " " | cut -f3 -d ' ')
docker rmi $images

