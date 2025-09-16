FROM node:22-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml tsconfig.json ./

RUN pnpm install --frozen-lockfile 

COPY . .

ENV CI=true
RUN pnpm run build && pnpm prune --prod

EXPOSE 8080

CMD ["pnpm", "start"]
