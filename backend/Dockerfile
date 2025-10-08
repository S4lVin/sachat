# BUILDER
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# PRODUCTION
FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD sh -c "npx prisma migrate deploy && npx prisma generate && npm run start"

# DEVELOPMENT
FROM builder AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD sh -c "npx prisma db push && npm run dev"