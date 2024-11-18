ARG NODE_IMAGE_TAG=lts-alpine

FROM node:${NODE_IMAGE_TAG}

LABEL maintainer="info@redmic.es"

ENV NODE_ENV="production"

EXPOSE 3050

CMD ["server-app", "-b"]

HEALTHCHECK --interval=30s --timeout=15s --start-period=1m --retries=3 \
	CMD wget --spider -q http://localhost:3050 || exit 1

ADD redmic-project-web-*.tgz /

WORKDIR /package

COPY package-lock.json .

RUN npm install --ignore-scripts && \
	npm cache clean --force && \
	rm -f package-lock.json

ARG VERSION

LABEL version="${VERSION}"

RUN echo "${VERSION}" > /version
