FROM node:22

RUN apt update \
    && npm install @nestjs/cli -g

USER node
