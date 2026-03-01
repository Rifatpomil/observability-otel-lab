FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/instrumentation.js ./
RUN npm ci --omit=dev
EXPOSE 3001
CMD ["node", "--import", "./instrumentation.js", "dist/index.js"]
