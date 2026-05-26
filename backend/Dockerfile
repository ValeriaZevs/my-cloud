FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod -R 777 node_modules/.bin

CMD ["npm", "start"]