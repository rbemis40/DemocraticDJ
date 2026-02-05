FROM node:latest

EXPOSE 8081

WORKDIR /
COPY --exclude=./shared/node_modules ./shared /shared
COPY --exclude=./game_server/node_modules ./game_server/ /game_server

WORKDIR /game_server
RUN npm install
RUN npm run build

CMD ["npm", "run", "start"]