ARG NODE_IMAGE_TAG=lts-alpine

FROM node:${NODE_IMAGE_TAG}

LABEL maintainer="info@redmic.es"

CMD ["server-app", "-b"]
ENV NODE_ENV="production"
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=15s --start-period=1m --retries=3 \
	CMD ["wget", "--spider", "-q", "http://127.0.0.1"]

ADD redmic-project-web-*.tgz /
WORKDIR /package
COPY package-lock.json .

RUN npm install --ignore-scripts && \
	npm cache clean --force && \
	rm -f package-lock.json

ARG VERSION
LABEL version="${VERSION}"
RUN echo "${VERSION}" > /version
