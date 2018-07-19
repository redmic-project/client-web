FROM node:alpine

ENV DIRPATH /opt/redmic

WORKDIR ${DIRPATH}

ADD dist*.tar.gz ./

RUN npm install --production

EXPOSE ${WEB_PORT}

ENTRYPOINT npm start -- -b
