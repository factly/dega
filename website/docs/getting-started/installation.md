---
sidebar_position: 2
---

# Installation

## Using Docker Compose

Docker Compose is the easiest way to install and get started with Dega on your system locally. 

### Pre-requisites

- Currently the setup is only tested for development on Mac OS and Linux
- Install and run Docker and Docker Compose

### Clone the required repositories

- [dega](https://github.com/factly/dega)

  ```
      git clone https://github.com/factly/dega.git
  ```

### Env files to be added

- Create config file with name config (and extension .env, .yml, .json) in `server/` and add config variables (eg. below)
  ```
  MODE=development

  # dependencies services
  KAVACH_URL=http://kavach-server:8000
  IMAGEPROXY_URL=http://127.0.0.1:7001
  KETO_URL=http://keto:4466
  NATS_URL=http://nats:4222
  KRATOS_PUBLIC_URL=http://kratos:4433
  IFRAMELY_URL=http://iframely:8061
  OATHKEEPER_HOST=oathkeeper:4455

  GOOGLE_KEY=GOOGLE_KEY       # for google fact checks search

  # database params
  DATABASE_HOST=postgres 
  DATABASE_USER=postgres
  DATABASE_PASSWORD=postgres
  DATABASE_NAME=dega 
  DATABASE_PORT=5432 
  DATABASE_SSL_MODE=disable

  TEMPLATES_PATH=web/templates/*

  DEFAULT_NUMBER_OF_MEDIA=10
  DEFAULT_NUMBER_OF_SPACES=2
  DEFAULT_NUMBER_OF_POSTS=10

  CREATE_SUPER_ORGANISATION=true      # give SUPER_ORGANISATION_TITLE, DEFAULT_USER_EMAIL & DEFAULT_USER_PASSWORD
  SUPER_ORGANISATION_TITLE='Dega Administration'
  DEFAULT_USER_EMAIL=admin@dega.in
  DEFAULT_USER_PASSWORD=password

  ENABLE_HUKZ=true        # include hukz in docker-compose and give HUKZ_URL, NATS_URL, NATS_USER_NAME & NATS_USER_PASSWORD
  ENABLE_FEEDS=true
  ENABLE_SEARCH_INDEXING=true     # include meilisearch in docker-compost and give MEILI_KEY & MEILI_URL

  MEILI_URL=http://meilisearch:7700
  MEILI_KEY=password

  NATS_URL=nats://nats:4222
  NATS_USER_NAME=natsuser
  NATS_USER_PASSWORD=natspassword
  HUKZ_URL=http://hukz:8000
  ```

- Create a folder companion in root `/` and create `.env` file inside companion and add config variables (eg. below)
  ```
  COMPANION_GOOGLE_KEY=GOOGLE_KEY
  COMPANION_GOOGLE_SECRET=GOOGLE_SECRET
  COMPANION_AWS_ENDPOINT=http://localhost:9000
  COMPANION_AWS_BUCKET=dega
  COMPANION_AWS_KEY=miniokey
  COMPANION_AWS_SECRET=miniosecret
  COMPANION_DOMAIN=localhost:3020
  COMPANION_PROTOCOL=http
  COMPANION_DATADIR=/
  COMPANION_SELF_ENDPOINT=localhost:3020
  NODE_ENV=dev
  ```

### Starting the application

- Execute the following command docker-compose command to start Dega

  ```
    docker-compose up
  ```

- When the application is started using docker-compose, a directory with name `factly` will be created at the root level to perisit all the data

### Access the application

Once the application is up and running you should be able to access it using the following urls:

- Dega: [http://127.0.0.1:4455/.factly/dega/studio/](http://127.0.0.1:4455/.factly/dega/studio/)
- Kavach: [http://127.0.0.1:4455/.factly/kavach/web/auth/login](http://127.0.0.1:4455/.factly/kavach/web/auth/login)

### Stopping the application

- Execute the following command docker-compose command to stop Dega and all the components

  ```
    docker-compose down
  ```