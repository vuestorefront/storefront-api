FROM node:10-alpine3.11

ENV VS_ENV prod

WORKDIR /var/www

RUN apk add --no-cache curl git python make g++

COPY package.json ./
COPY yarn.lock ./

RUN apk --no-cache --update upgrade musl
RUN apk add --no-cache \
			--repository http://dl-cdn.alpinelinux.org/alpine/edge/community \
			--repository http://dl-cdn.alpinelinux.org/alpine/edge/main \
			--virtual .build-deps \
        python \
        make \
        g++ \
        ca-certificates \
        wget \
    && yarn install --no-cache \
    && apk del .build-deps

COPY docker/storefront-api/storefront-api.sh /usr/local/bin/

CMD ["storefront-api.sh"]
