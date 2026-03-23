FROM node:25-alpine

EXPOSE 8081

WORKDIR /
COPY ./shared /shared
COPY ./game_server/ /game_server

WORKDIR /game_server
RUN npm install
RUN npm run build

CMD ["npm", "run", "start"]