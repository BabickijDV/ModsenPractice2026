FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npx tsc --outDir dist

EXPOSE 3000

CMD ["node", "dist/main"]