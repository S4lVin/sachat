FROM node:lts-alpine

WORKDIR /app

COPY ./package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && npx prisma generate && npm run start"
