```bash
docker stop sgrh-frontend-container

```


```bash

docker rm sgrh-frontend-container

```


```bash

docker build -t sgrh-frontend:prod --build-arg VITE_BASE_URL=IP .

```


```bash

docker run -d -p 8080:80 --restart unless-stopped --name sgrh-frontend-container sgrh-frontend:prod

```