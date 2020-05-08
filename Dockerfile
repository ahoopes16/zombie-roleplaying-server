FROM node
ENV port 8000
COPY . /app

WORKDIR /app

RUN yarn

CMD ["yarn", "start-docker"]

EXPOSE 8000
