---
sidebar_position: 3
---

# Services for Dega and their significance

- ```Minio``` - It is used as the blob storage service in dega. 

- ```Iframely``` - Iframely is mainly used in editor components for embedding. 

- ```Companion``` - Companion is needed for the uppy component in the studio which we use for uploading images.

- ```Mailslurper``` - This service is a dependency for kratos. It acts as a proxy email client which has all the emails that are sent by kratos. 


- ```Keto, Kratos and Oathkeeper``` - All these services are dependencies for authentication, authorization and session management for dega as well as kavach.

- ```Keto-migrate and kratos-migrate``` - these services are dependencies for Keto and Kratos, so they are required.


- ```Kavach-web, Kavach-server, Kavach-migrate``` - Kavach will manage the users, roles, policies, tokens and spaces. Kavach-web is the web application which provides user interface to manage roles, policies, tokens, applications and spaces. Kavach-server is the API service which validates the entities and users in kavach and stores the data in the database. Kavach-migrate sets up the environment like database-schema for Kavach-server.

- ```Dega-studio, Dega-server, Dega-migrate, Dega-api``` - Dega studio is the web application for managing users, spaces, posts and other entities in dega. Dega server is the API which handle the validation of users and stores the dega entities to database. Dega API is a GraphQL API service which can be used to get the data from dega-server using a API token. 

### We have some optional services which you can enable/disable based on your used case.

- ```Postgres``` - The primary DB service that we use for dega is postgres. We can use sqlite instead of postgres for the light version. We can do that by enabling USE_SQLITE=true environment variable.

- ```Imgproxy``` - We use imgproxy for getting the proxy URL of the image. Proxy URLs help in changing the attributes like height, width, etc. of an image. It is optional we can enable it by setting ENABLE_IMGPROXY=true in environment variable.

- ```Meilisearch``` - If we remove this then we have to remove all the search bars and make some changes on the server side too. It is optional but removing it might take some time. It is optional we can enable it by setting ENABLE_SEARCH_INDEXING=true in environment variable.

- ```Redis``` - Redis is mainly use for caching in Dega API. It is optional we can enable it by setting ENABLE_CACHING=true in environment variable.

- ```Hukz, Hukz-migrate and Nats``` - Hukz service is used to send notifications to apps like Google Chat and Slack. Hukz migrate sets up the environment for hukz service. NATS is dependency for Hukz. It is optional we can enable it by setting ENABLE_HUKZ=true in environment variable.

- ```Dega (templates)``` - It is still in the development stage and we are still experimenting with it so we can make it optional for now.

:::note
for more information about environment variables refer [configurations](./configuration)
:::
