ARG NODE_IMAGE_TAG=18.1.0-alpine3.15

FROM node:${NODE_IMAGE_TAG}

LABEL maintainer="info@redmic.es"

EXPOSE 3050

HEALTHCHECK --interval=30s --timeout=15s --start-period=1m --retries=3 \
	CMD wget --spider -q http://localhost:3050 || exit 1

CMD ["app", "-b"]

ARG DIRPATH=/redmic

WORKDIR ${DIRPATH}

ADD dist*.tar.gz ./

RUN node -e 'const fs = require("fs"); const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8")); delete pkg.devDependencies; fs.writeFileSync("./package.json", JSON.stringify(pkg), "utf-8");' && \
	yarn install --production --ignore-optional --ignore-scripts && \
	yarn cache clean && \
	yarn autoclean --init && yarn autoclean --force && \
	rm -f yarn.lock .yarnclean
