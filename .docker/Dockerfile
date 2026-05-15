FROM node:22-alpine3.21 AS deps

WORKDIR /app

RUN npm install -g pnpm@9 --quiet

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM node:22-alpine3.21 AS builder

WORKDIR /app

RUN npm install -g pnpm@9 --quiet

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build


FROM node:22-alpine3.21 AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm@9 --quiet

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
