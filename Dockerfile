FROM node:11-alpine

LABEL maintainer="info@redmic.es"

ARG PORT=3050
ARG DIRPATH=/redmic

EXPOSE ${PORT}

WORKDIR ${DIRPATH}

ADD dist*.tar.gz ./

RUN npm install --production

CMD ["node", "app", "-b"]
