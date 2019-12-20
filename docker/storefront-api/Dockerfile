FROM node:10-alpine

ENV VS_ENV prod

WORKDIR /var/www

RUN apk add --no-cache curl git

COPY package.json ./
COPY yarn.lock ./

RUN apk --no-cache --update upgrade musl
RUN apk add --no-cache \
			--repository http://dl-3.alpinelinux.org/alpine/edge/community \
			--repository http://dl-3.alpinelinux.org/alpine/edge/main \
			--virtual .build-deps \
        python \
        make \
        g++ \
        ca-certificates \
        wget \
        vips-dev \
    && yarn install --no-cache \
    && apk del .build-deps

COPY docker/storefront-api/storefront-api.sh /usr/local/bin/

CMD ["storefront-api.sh"]
