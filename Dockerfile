# Usar imagem oficial Node 20.11.0
FROM node:20.11.0

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas package.json e yarn.lock para otimizar cache
COPY package.json yarn.lock ./

# Instala Yarn 1.22.22 (Classic)
RUN corepack enable && \
    corepack prepare yarn@1.22.22 --activate

# Instala dependências usando Yarn 1
RUN yarn install --frozen-lockfile

# Copia todo o código do projeto
COPY . .

# Efetua o build do projeto (assumindo frontend Vue/React)
RUN yarn build

# Se for projeto Vue CLI / Vite, os arquivos finais geralmente vão para:
#   /app/dist
# Vamos usar um Nginx minimal para servir os arquivos estáticos
FROM nginx:alpine

# Remove conteúdo default do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia arquivos build para diretório que o Nginx serve
COPY --from=0 /app/dist /usr/share/nginx/html

# Expõe porta 80
EXPOSE 80

# Comando padrão para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]