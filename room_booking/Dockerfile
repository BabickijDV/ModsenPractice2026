FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./

RUN npm install --legacy-peer-deps
RUN npm install -g typescript

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD npx prisma migrate deploy && node dist/main
