FROM node:18 as build

EXPOSE 80

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY .  .


RUN npm run build

CMD [ "npm", "start" ]