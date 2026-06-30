# Stage 1: build
FROM node:24-alpine AS builder

WORKDIR /app

# Сначала только манифесты — кэш слоя npm не инвалидируется при правках кода.
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: production
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
# adapter-node слушает PORT (по умолчанию 3000) на 0.0.0.0.
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

EXPOSE 3000

# URL API не «зашит» в образ — задаётся в рантайме (docker-compose `environment`,
# переменная PUBLIC_PIXPLAZE_WEB_API_URL), читается через $env/dynamic/public.
CMD ["node", "build"]
