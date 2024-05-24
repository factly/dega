# Dega


## Setting up development environment for Dega

### Pre-requisites

- Currently the setup is only tested for development on Mac OS and Linux
- Install and run Docker and Docker Compose

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

### Env files to be added

- Create config file with name config (and extension .env, .yml, .json) in `server/`, `api/` and `templates/` add config variables (for eg see config.env.example in each folder)
- Create a `.env` file inside companion folder in root for companion config variables (for eg see .env.example file in companion folder)
git fetch upstream 
- to add default env files automatically run `bash build.sh` 

## Development Notes
- If there are updates to npm dependencies for `dega-studio`, run `bash build-nocache.sh` from the project root.
- If the script fails to update dependencies, enter the container and manually run `npm install --legacy-peer-deps`.

