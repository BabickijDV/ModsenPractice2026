FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npx nest build

EXPOSE 3000

CMD ["node", "dist/main"]