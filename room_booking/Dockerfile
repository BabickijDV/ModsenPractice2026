FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

RUN npm install -g typescript

COPY . .

RUN tsc --outDir dist

EXPOSE 3000

CMD ["node", "dist/main"]