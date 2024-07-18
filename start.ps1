docker compose --file 'docker-compose.yaml' --project-name 'django' down 
docker-compose build --progress=plain 
docker compose -f docker-compose.yaml up -d
