FROM node:latest

EXPOSE 8080

WORKDIR /
COPY ./shared/ /shared
COPY ./api/ /api

WORKDIR /api

RUN ["npm", "install"]
RUN ["npm", "run", "build"]

CMD ["npm", "run", "start"]
