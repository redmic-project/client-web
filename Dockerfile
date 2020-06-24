ARG NODE_IMAGE_TAG=11.15.0-alpine

FROM node:${NODE_IMAGE_TAG}

LABEL maintainer="info@redmic.es"

ARG PORT=3050
ARG DIRPATH=/redmic

EXPOSE ${PORT}

ENV PORT=${PORT}

WORKDIR ${DIRPATH}

ADD dist*.tar.gz ./

RUN npm install --production

HEALTHCHECK --interval=30s --timeout=15s --start-period=1m --retries=3 \
	CMD wget --spider -q http://localhost:${PORT} || exit 1

ENTRYPOINT ["/bin/sh"]

CMD ["-c", "node app -b -p ${PORT}"]
