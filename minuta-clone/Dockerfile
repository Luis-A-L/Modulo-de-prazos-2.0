# Estágio 1: Build da aplicação React/Vite
FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o restante do código
COPY . .

# Aceitar e definir a chave da API como variável de ambiente PÚBLICA (build-time)
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Gerar os arquivos estáticos de produção
RUN npm run build

# Estágio 2: Subir o servidor Nginx mínimo
FROM nginx:alpine

# Copiar arquivo de configuração do Nginx (suporte a React Router/SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar apenas a pasta /dist para o pasta padrão do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expor a porta que o Nginx usará
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
