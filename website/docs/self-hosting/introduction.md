---
sidebar_position: 1
---

# Installation

- For running dega, install docker and docker-compose on your system.

- Clone dega from the git repository:
  ```
  git clone https://github.com/factly/dega.git
  ```

- Create env file for studio, server and api. Refer [configurations](/docs/developer-docs/configuration).

- There are two kinds of docker-compose files - 1) docker-compose.yml and 2) docker-compose-lite.yml. 
docker-compose.yml has mandatory as well as some optional services whereas docker-compose-lite.yml has only mandatory services. To know more about dega services refer [this page](/docs/developer-docs/services).

- Create a companion folder in the root directory of the project and add .env file in the companion folder. For companion environment variables refer [this](/docs/developer-docs/configuration#environment-variable-for-companion-service). 

- Create config.env inside ```/server``` and ```/api``` folder and add the environment variables. For environment variables refer config.env.example or config-lite.env.example depending on what version you are trying to install and for more information about environment variable refer [this](/docs/developer-docs/configuration#environment-variables-for-dega-server).

- After adding the environment variables run 
```
# for running the lite version
docker-compose -f docker-compose-lite.yml up 
# for running all the services
docker-compose up 
```





