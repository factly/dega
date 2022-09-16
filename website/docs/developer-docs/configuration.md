---
sidebar_position: 2
---
# Configurations for Dega

## Environment variables for Dega Studio
- ```REACT_APP_KRATOS_PUBLIC_URL``` : the address/URL for kratos-public API.
- ```REACT_APP_API_URL```: the addresss/URL for dega-server
- ```REACT_APP_COMPANION_URL```: the address/URL for companion service.
- ```PUBLIC_URL```: the base URL for dega-studio
- ```REACT_APP_KAVACH_PUBLIC_URL```: the address/URL for kavach web
- ```REACT_APP_IFRAMELY_URL```: the address/URL for iframely service
- ```REACT_APP_ENABLE_IMGPROXY```: boolean value which controls which URLs(in dega there are two kind of URLs raw and proxy, proxy URLs give you more control over the images you can control different attributes like height, width, etc. of an image by adding query parameters to it) are used to display images
- ```REACT_APP_SACH_API_URL```: the address/URL for Sach API. (SACH (Search Application for Claims & Hoaxes) is a web based search application that enables one to search for fact-checks published by organizations around the world, using text or images.)

```
window.REACT_APP_KRATOS_PUBLIC_URL = 'http://127.0.0.1:4455/.ory/kratos/public';
window.REACT_APP_API_URL = 'http://127.0.0.1:4455/.factly/dega/server';
window.REACT_APP_COMPANION_URL = 'http://127.0.0.1:3020';
window.PUBLIC_URL = 'http://127.0.0.1:4455/.factly/dega/studio';
window.REACT_APP_KAVACH_PUBLIC_URL = 'http://127.0.0.1:4455/.factly/kavach/web';
window.REACT_APP_SACH_API_URL = 'https://sach-server.factly.in';
window.REACT_APP_IFRAMELY_URL = 'http://127.0.0.1:4455/.factly/dega/server/meta';
window.REACT_APP_ENABLE_IMGPROXY = false;

```

## Environment variables for Dega Server
- ```MODE```:  the env in which dega-server is running. It can have two values - "development" and "production"
-  ```KAVACH_URL```: the address/URL for kavach-server
- ```IMAGEPROXY_URL```: the address/URL for imageproxy
- ```KETO_URL```: the address/URL for keto-read API
- ```KRATOS_PUBLIC_URL```: the address/URL for kratos public API
- ```IFRAMELY_URL```: the address/URL for iframely service
- ```OATHKEEPER_HOST```: the address URL for oathkeeper service
- ```GOOGLE_FACT_CHECK_SEARCH_ENABLED```: it is a boolean value which controls whether the google fact check search is enabled or not
- ```GOOGLE_KEY```: it is an API key which is used to get fact checks from google fact check tools API  
- ```DATABASE_HOST``` : the address/URL of the database
- ```DATABASE_USER``` : the username of the database user.
- ```DATABASE_PASSWORD``` : the password of the database user.
- ```DATABASE_SSL_MODE``` : when true, enables secure socket layers which verifies the user certificate.
- ```DATABASE_NAME``` : the name of the database
- ```DATABASE_PORT``` : the port of the database.
- ```USE_SQLITE```: it is a boolean value if true it uses SQLITE as the database. If USE_SQLITE is true you dont need to pass the env variables with prefix 'DATABASE'.
- ```SQLITE_DB_PATH```: the path where the .db file to which SQLITE will write will be stored.
- ```TEMPLATES_PATH```: the path where the templates are stored
- ```ORGANISATION_PERMISSION_ENABLED```: it is a boolean value which controls whether the organisation permissions will be enabled or not
- ```DEFAULT_NUMBER_OF_MEDIA```: the maximum number of media you can upload for a space which is not in super organisation and ORGANISATION_PERMISSION_ENABLED is false
- ```DEFAULT_NUMBER_OF_SPACES```: the maximum number of spaces you can upload for a space which is not in super organisation and ORGANISATION_PERMISSION_ENABLED is false
- ```DEFAULT_NUMBER_OF_POSTS```: the maximum number of posts you can upload for a space which is not in super organisation and ORGANISATION_PERMISSION_ENABLED is false
- ```CREATE_SUPER_ORGANISATION```: when enabled it creates super organisation while running dega-migrate service.
- ```DEFAULT_USER_EMAIL```: the email of the super user
- ```DEFAULT_USER_PASSWORD```: the password of the super user
- ```ENABLE_HUKZ```: it is a boolean value which controls whether the hukz service is used or not.
- ```HUKZ_URL```=http://hukz:8000
- ```ENABLE_FEEDS```: it controls whether feed is SEO optimized or not.
- ```ENABLE_SEARCH_INDEXING```: if true it uses meilisearch for search indexing otherwise database is used for the search results.
- ```MEILI_URL```: it is address/URL for meili API.
- ```MEILI_API_KEY```: API key for meilisearch
- ```NATS_URL```: the addresss/URL for nats service
- ```NATS_USER_NAME```: username for NATS service
- ```NATS_USER_PASSWORD```: password for NATS service
```
MODE=development
KAVACH_URL=http://kavach-server:8000
IMAGEPROXY_URL=http://127.0.0.1:7001
KETO_URL=http://keto:4466
KRATOS_PUBLIC_URL=http://kratos:4433
IFRAMELY_URL=http://iframely:8061
OATHKEEPER_HOST=oathkeeper:4455

GOOGLE_FACT_CHECK_SEARCH_ENABLED=false
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
ORGANISATION_PERMISSION_ENABLED=false
CREATE_SUPER_ORGANISATION=true      
DEFAULT_USER_EMAIL=admin@dega.in
DEFAULT_USER_PASSWORD=2ssad32sadADSd@!@4
ENABLE_HUKZ=true   
HUKZ_URL=http://hukz:8000
ENABLE_FEEDS=true
ENABLE_SEARCH_INDEXING=true     

MEILI_URL=http://meilisearch:7700
MEILI_API_KEY=password
NATS_URL=nats://nats:4222
NATS_USER_NAME=natsuser
NATS_USER_PASSWORD=natspassword
```

## Environment variables for Dega API

- ```DATABASE_HOST``` : the address/URL of the database
- ```DATABASE_USER``` : the username of the database user.
- ```DATABASE_PASSWORD``` : the password of the database user.
- ```DATABASE_SSL_MODE``` : when true, enables secure socket layers which verifies the user certificate.
- ```DATABASE_NAME``` : the name of the database
- ```DATABASE_PORT``` : the port of the database.
- ```USE_SQLITE```: it is a boolean value if true it uses SQLITE as the database. If USE_SQLITE is true you dont need to pass the env variables with prefix 'DATABASE'.
- ```SQLITE_DB_PATH```: the path where the .db file to which SQLITE will write will be stored.
-  ```KAVACH_URL```: the address/URL for kavach-server
- ```ENABLE_CACHE```: it is boolean value which controls whether caching is enabled or not
- ```REDIS_URL```: the address/URL for Redis.
- ```REDIS_PASSWORD```: the password for Redis.
- ```ENABLE_SEARCH_INDEXING```: if true it uses meilisearch for search indexing otherwise database is used for the search results.
- ```MEILI_URL```: it is address/URL for meili API.
- ```MEILI_API_KEY```: API key for meilisearch

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

## Environment variable for companion service

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