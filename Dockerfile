#FROM node:14.16.0-alpine3.11
#RUN apk update && apk add ffmpeg && rm -rf /var/cache/apk/*

FROM node:14-buster-slim
RUN apt -y update > /dev/null && \
	apt install -y ffmpeg && \
	apt clean && rm -rf /var/lib/apt/lists/*

WORKDIR /home

COPY ./ ./

RUN npm install

CMD ["node", "index.js"]
