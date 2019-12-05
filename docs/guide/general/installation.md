
# Installation
<style>
    img[alt*="borderline"] {
        border: 1px #000 solid;
    }
</style>

In this chapter, we will cover : 

[[toc]]


## 0. Introduction
Now you are definitely interested in **Storefront Api**. That's why you are here. You've come across the line. You made a choice. You will have something in return, which is great. Be it developers, entrepreneurs or even marketing managers that they may want to try something new for better products in hopes of enhancing their clients or customers' experience. You chose the right path. We will explore anything you need to get you started at all with [**Storefront Api** infrastructure](https://github.com/DivanteLtd/storefront-api).

## 1. Install with Docker
Docker has been arguably the most sought-after, brought to the market which took the community by storm ever since its introduction. Although it's yet controversial whether it's the best choice among its peers, I have never seen such an unanimous enthusiasm over one tech product throughout the whole developers community. 

Then, why so? In modern computer engineering, products are so complex with an endless list of dependencies intertwined with each other. Building such dependencies in place for every occasion where it's required is one hell of a job, not to mention glitches from all the version variation. That's where Docker steps in to make you achieve **infrastructure automation**. This concept was conceived to help you focus on your business logic rather than having you stuck with hassles of lower level tinkering. 

Luckily, we already have been through all this for you, got our hands dirty. All you need is run a set of docker commands to get you up and running from scratch. Without further ado, let's get started!

### 1. Preparation
- You need [`docker`](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04) and [`docker-compose`](https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-18-04) installed. 

- You need [`git`](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-18-04) installed.

:::tip NOTE
We will walk you with docker on *Linux*. (Specifically *Ubuntu 18.04* if needed)

There is only one bias for Docker before using it; *Run it on Linux*. Docker is native Linux, was created using a Linux technology; LXC (linux container) in the first place. Even though there were many attempts made to make it available to other platforms as it does on Linux, and it has definitely been on a progress, however, using Docker on Linux is the solidest way to deal with the technology. 

:::

### 2. Recipe
1. First, download [**Storefront Api**](https://github.com/DivanteLtd/storefront-api) from github.
```bash
git clone https://github.com/DivanteLtd/storefront-api.git storefront-api
cd storefront-api
```

2. Copy `./config/default.json` to `./config/local.json`
```bash
cp config/default.json config/local.json
```
Then edit `local.json` to your need. 

:::tip TIP
This step can be skipped if you are OK with values of `default.json` since it follows the [files load order](https://github.com/lorenwest/node-config/wiki/Configuration-Files#file-load-order) of [node-config](https://github.com/lorenwest/node-config)

:::

3. Run the following Docker command : 

For using Storefront Api with embedded the Elastic 7:
```bash
docker-compose -f docker-compose.yml up -d
```

Then, to restore the demo data set please run:
`docker exec -it sfa_app_1 yarn restore7`

The result would look something like this : 
```bash
Building app
Step 1/8 : FROM node:10-alpine
 ---> 9dfa73010b19
Step 2/8 : ENV VS_ENV prod
 ---> Using cache
 ---> 4d0a83421665
Step 3/8 : WORKDIR /var/www
 ---> Using cache
 ---> e3871c8db7f3
Step 4/8 : RUN apk add --no-cache curl git
 ---> Using cache
 ---> 49e996f0f6cb
Step 5/8 : COPY package.json ./
 ---> 14ed18d76efc
Step 6/8 : RUN apk add --no-cache --virtual .build-deps ca-certificates wget &&     yarn install --no-cache &&     apk del .build-deps
 ---> Running in 3d6f91acc2fe
fetch http://dl-cdn.alpinelinux.org/alpine/v3.9/main/x86_64/APKINDEX.tar.gz
fetch http://dl-cdn.alpinelinux.org/alpine/v3.9/community/x86_64/APKINDEX.tar.gz
(1/2) Installing wget (1.20.3-r0)
(2/2) Installing .build-deps (0)
Executing busybox-1.29.3-r10.trigger
OK: 22 MiB in 26 packages
yarn install v1.16.0
info No lockfile found.
[1/4] Resolving packages...
warning @babel/node > @babel/polyfill@7.4.4: 🚨 As of Babel 7.4.0, this
package has been deprecated in favor of directly
including core-js/stable (to polyfill ECMAScript
features) and regenerator-runtime/runtime
(needed to use transpiled generator functions):

  > import "core-js/stable";
  > import "regenerator-runtime/runtime";
warning eslint > file-entry-cache > flat-cache > circular-json@0.3.3: CircularJSON is in maintenance only, flatted is its successor.
[2/4] Fetching packages...

# ... abridged


```

:::tip TIP
`-f` flag allows you to use the following docker-compose file. Without this flag, it will use the default file that is `docker-compose.yml`

`-d` flag allows you to run the command in `detach mode` which means *running background*.
:::
3. In order to verify, run `docker ps` to show which containers are up
```bash
docker ps 
```

Then, 
```bash
CONTAINER ID        IMAGE                     COMMAND                  CREATED             STATUS              PORTS                                            NAMES
53a47d5a6440        sfa_kibana   "/bin/bash /usr/loca…"   31 seconds ago      Up 29 seconds       0.0.0.0:5601->5601/tcp                           sfa_kibana_1
7d8f6328601b        sfa_app      "docker-entrypoint.s…"   31 seconds ago      Up 27 seconds       0.0.0.0:8080->8080/tcp                           safa_app_1
165ae945dbe5        sfa_es1      "/bin/bash bin/es-do…"   8 days ago          Up 30 seconds       0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   elasticsearch
8dd144746cef        redis:4-alpine            "docker-entrypoint.s…"   11 days ago         Up 31 seconds       0.0.0.0:6379->6379/tcp                           sfa_redis_1
```
The ports number will be used later in the frontend configuration. In fact, they are already set in as default values. 

You will see 4 containers are running, which is :
| Container              |          Port       |
|------------------------|---------------------|
| Storefront Api app | :8080               |
| Elasticsearch          | :9200               |
| Kibana                 | :5601               |
| Redis                  | :6379               |


### 3. Peep into the kitchen (what happens internally) 
We used `docker-compose` for setting up the entire environment of Storefront Api. It was more than enough to launch the machines behind for running the shop.

It was possible because `docker` encapsulated the whole bunch of infrastructure into a linear set of declarative definition for the desired state. 

The `docker-compose` had a `yml` file for input. This file describes its base requirement all but **Storefront API** itself; that is, **Elasticsearch** as data store, **Redis** for cache and **Kibana** for helping you grab your data visually (a pair of Elasticsearch).
```yaml
version: '3.0'
services:
  es1:
    container_name: elasticsearch
    build: docker/elasticsearch/
    ulimits:
      memlock:
        soft: -1
        hard: -1    
    volumes:
      - ./docker/elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
    ports:
      - '9200:9200'
      - '9300:9300'
    environment:
      - discovery.type=single-node
      - cluster.name=docker-cluster
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xmx512m -Xms512m"

  kibana:
    build: docker/kibana/
    volumes:
      - ./docker/kibana/config/:/usr/share/kibana/config:ro
    ports:
      - '5601:5601'
    depends_on:
      - es1

  redis:
    image: 'redis:4-alpine'
    ports:
      - '6379:6379'
  app:
    # image: divante/storefront-api:latest
    build:
      context: .
      dockerfile: docker/storefront-api/Dockerfile
    depends_on:
      - es1
      - redis
    env_file: docker/storefront-api/default.env
    environment:
      VS_ENV: dev
    volumes:
      - './config:/var/www/config'
      - './ecosystem.json:/var/www/ecosystem.json'
      - './migrations:/var/www/migrations'
      - './package.json:/var/www/package.json'
      - './babel.config.js:/var/www/babel.config.js'
      - './tsconfig.json:/var/www/tsconfig.json'
      - './nodemon.json:/var/www/nodemon.json'
      - './graphql-schema-linter.config.js:/var/www/graphql-schema-linter.config.js'
      - './scripts:/var/www/scripts'
      - './src:/var/www/src'
      - './var:/var/www/var'
    tmpfs:
      - /var/www/dist
    ports:
      - '8080:8080'

      

volumes:
  esdat1:
```
:::tip NOTE 
Once a term explained, it will be ignored thereafter for consecutive occurrence.
:::
`version` denotes which version of `docker-compose` this file uses.  

`services` describe containers. It codifies how they should run. In other words, it codifies option flags used with `docker run ...`

`es1` contains information of data store *Elasticsearch* container.
- `build` denotes build path of container.
- `volumes` contains the mount path of volumes shared between host and container as *host:container*
- `ports` connect ports between host and container as in *host:container*
- `environment` allows you to add environment variables. `Xmx512m` means JVM will take up to maximum 512MB memory. `Xms512m` means minimum memory. Combining them, there will be no memory resize, it will just stick to 512MB from start to end throughout its life cycle. 

`kibana` contains information of *Kibana* application container.
- `depends_on` creates dependency for a container of other containers. So, this container is dependent on `es1` that's just described above. 
- `volumes` mean volumes shared, `:ro` creates the volume in `read-only` mode for the container. 

`redis` contains information of *Redis* cache application container. 

- `image` node contains the name of image this container is based on. 

`volumes` in top level can be used as a reference to be used across multiple services(containers). 
<br />
<br />

`app` contains information of *Storefront API* application. 
- `build` is path for build information. If the value is string, it's a plain path. When it's object, you may have a few options to add. `context` is relative path or git repo url where `Dockerfile` is located. `dockerfile` node may change the path/name of `Dockerfile`. [more info](https://docs.docker.com/compose/compose-file/#build)
- `depends_on` tells us this container is based on `es1` and `redis` containers we created above. 
- `env_file` helps you add environment values from files. It's relative path from the `docker-compose` file that is in the process, in this case, it's `docker-compose.nodejs.yml`  
- `environment` is to set `VS_ENV` as `dev` so that environment will be setup for developer mode. 
- `tmpfs` denotes temporary volumes that are only available to host memory. Unlike `volumes`, this `tmpfs` will be gone once the container stops. This option is only available to *Linux*.

<br />
<br />
