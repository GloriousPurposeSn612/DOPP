FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY server.js ./
COPY database.json ./
COPY public ./public

EXPOSE 3000

CMD ["node", "server.js"]