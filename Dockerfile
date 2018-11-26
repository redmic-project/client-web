FROM node:11-alpine

LABEL maintainer="info@redmic.es"

ARG PORT=3050
ARG DIRPATH=/redmic

EXPOSE ${PORT}

WORKDIR ${DIRPATH}

RUN npm install --production

ADD dist*.tar.gz ./

CMD ["node", "app", "-b"]
