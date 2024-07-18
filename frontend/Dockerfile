FROM node:14

WORKDIR /app

COPY src/ /app/src/
COPY public/ /app/public/
COPY .env package.json package-lock.json /app/

RUN npm install

CMD [ "npm", "start" ]