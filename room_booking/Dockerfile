FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN node node_modules/@nestjs/cli/bin/nest.js build

EXPOSE 3000

CMD ["node", "dist/main"]