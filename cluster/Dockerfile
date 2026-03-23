FROM node:25-alpine

EXPOSE 8080
EXPOSE 8081

WORKDIR /
COPY ./shared /shared
COPY ./cluster /cluster

WORKDIR /cluster

RUN ["npm", "install"]
RUN ["npm", "run", "build"]

CMD ["npm", "run", "start"]