---
sidebar_position: 2
---
# Configurations for Dega

## Environment variables for Dega Studio

```
REACT_APP_KRATOS_PUBLIC_URL = 'http://127.0.0.1:4455/.ory/kratos/public';
REACT_APP_API_URL = 'http://127.0.0.1:4455/.factly/dega/server';
REACT_APP_COMPANION_URL = 'http://127.0.0.1:3020';
PUBLIC_URL = 'http://127.0.0.1:4455/.factly/dega/studio';
REACT_APP_KAVACH_PUBLIC_URL = 'http://127.0.0.1:4455/.factly/kavach/web';
REACT_APP_SACH_API_URL = 'https://sach-server.factly.in';
REACT_APP_IFRAMELY_URL = 'http://127.0.0.1:4455/.factly/dega/server/meta';

```

## Environment variables for Dega Server
```
MODE=development
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

# set this to true if want to use sqlite db
USE_SQLITE=false
SQLITE_DB_PATH=dega.db
TEMPLATES_PATH=web/templates/*
DEFAULT_NUMBER_OF_MEDIA=10
DEFAULT_NUMBER_OF_SPACES=2
DEFAULT_NUMBER_OF_POSTS=10
CREATE_SUPER_ORGANISATION=true      
DEFAULT_USER_EMAIL=admin@dega.in
DEFAULT_USER_PASSWORD=2ssad32sadADSd@!@4
ENABLE_HUKZ=true        
ENABLE_FEEDS=true
ENABLE_SEARCH_INDEXING=true     

MEILI_URL=http://meilisearch:7700
MEILI_API_KEY=password
NATS_URL=nats://nats:4222
NATS_USER_NAME=natsuser
NATS_USER_PASSWORD=natspassword
HUKZ_URL=http://hukz:8000
```

## Environment variables for Dega API

```
DATABASE_HOST=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=dega 
DATABASE_PORT=5432 
DATABASE_SSL_MODE=disable

USE_SQLITE=true
SQLITE_DB_PATH=dega.db

KAVACH_URL=http://kavach-server:8000

ENABLE_CACHE=false
REDIS_URL=redis:6379
REDIS_PASSWORD=redispass

ENABLE_SEARCH_INDEXING=true
MEILI_URL=http://meilisearch:7700
MEILI_API_KEY=password
```