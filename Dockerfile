# ---------- Stage 1: build ----------
FROM node:20.11.0-alpine AS builder

WORKDIR /app

RUN corepack enable \
 && corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./
RUN yarn config set network-timeout 600000 -g \
 && yarn config set registry https://registry.npmjs.org -g \
 && yarn install --non-interactive --network-concurrency 1

COPY . .

ARG VITE_BASE_URL
ENV VITE_BASE_URL=${VITE_BASE_URL}

RUN yarn build

# ---------- Stage 2: serve ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
