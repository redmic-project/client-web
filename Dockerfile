FROM node:alpine

ENV DIRPATH /opt/redmic

WORKDIR $DIRPATH

ADD dist*.tar.gz ./

RUN npm install --production

EXPOSE 3050

ENTRYPOINT npm start -- -b
