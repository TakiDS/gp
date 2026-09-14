# Estágio 1: Build (Onde a mágica acontece)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copia tudo, mas o .dockerignore vai filtrar a pasta .angular/cache
COPY . .

# Build de produção
RUN npm run build -- --configuration=production --delete-output-path=true

# Estágio 2: Servir com Caddy
FROM caddy:alpine

# Copia os arquivos gerados no Estágio 1 para o Caddy
COPY --from=build /app/dist/*/browser /usr/share/caddy

# Copia configuração do Caddy
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
EXPOSE 443
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]