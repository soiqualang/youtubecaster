FROM node:14.16.0-alpine3.11

RUN apk update && apk add ffmpeg && rm -rf /var/cache/apk/*

WORKDIR /home

COPY ./ ./

RUN npm install

CMD ["node", "index.js"]
