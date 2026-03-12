# SGRH
Sistema de Gestão de Recursos Humanos

docker stop sgrh-frontend-container
 
docker rm sgrh-frontend-container
 
docker build -t sgrh-frontend:prod \
  --build-arg VITE_BASE_URL=IP .
 
docker run -d -p 8080:80 --restart unless-stopped \
  --name sgrh-frontend-container sgrh-frontend:prod