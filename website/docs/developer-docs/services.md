---
sidebar_position: 3
---

# Services for Dega and their significance

- Postgres(optional) - We can use sqlite instead of postgres for the light version.
- Minio(mandatory) - It is used for storing images so for that reason I think it will be mandatory.
- Iframely(mandatory) - Iframely is mainly used in editor components for embedding. We can have an environment variable which can control whether the embed feature is there or not in the editor.
- Imgproxy(mandatory) - We use imgproxy for getting the proxy URL of the image. Currently we are working on making imgproxy independent.
- Companion(mandatory) - companion is needed for the uppy component in the studio which we use for uploading images.
- Mailslurper(mandatory) - this service is a dependency for kratos. It acts as a proxy email client which has all the emails that are sent by kratos. So we can remove it.
- Meilisearch (optional) - If we remove this then we have to remove all the search bars and make some changes on the server side too. It is optional but removing it might take some time.
- Keto, Kratos and Oathkeeper(mandatory) - All these services are dependencies for authentication, authorization and session management for dega as well as kavach.
- Keto-migrate and kratos-migrate (mandatory) - these services are dependencies for Keto and Kratos, so they are required.
- Redis (Optional) - we can make caching optional.
- Kavach (web, server, migrate)(mandatory) - Kavach will manage the roles, policies, tokens and spaces for which it is required.
- Hukz, Hukz-migrate and Nats (optional) - Depends on whether the end user wants notifications or not. We have an environment which controls the hukz.
- Dega (templates) (optional)- It is still in the development stage and we are still experimenting with it so we can make it optional for now.
- Dega (studio, server, migrate, api) - (Mandatory)


