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

## Kavach
Kavach is an open-source identity and access management solution. It is a lightweight solution with features to manage organizations, users, permissions and can be configured easily to support applications required multitenancy. Kavach is written in Go, React and is built on ORY stack of services.

GitHub Repository: [https://github.com/factly/kavach](https://github.com/factly/kavach)

To access application
- Kavach: [http://127.0.0.1:4455/.factly/kavach/web/auth/login](http://127.0.0.1:4455/.factly/kavach/web/auth/login)
  
  #### Organisation
  - Kavach supports multitenancy where user can be part of multiple organisations.
  - The one who creates organisation will be admin by default.

  |      |    |
  |------------------------------------------------|------------------------------------------------------|
  | ![ new user](../dega/images/create_organisation.png)     |

  #### User
  - User role can be either owner or member.
  
  |      |    |
  |------------------------------------------------|------------------------------------------------------|
  | ![ new user](../dega/images/add_user.png)     | ![ users](../dega/images/users_list.png)         |

  #### Application
    - An organisation can have multiple applications.
    - Once the user creates application can add other members to give them access to that application.
    - API Token can be generated at application level.

  |      |    |
  |------------------------------------------------|------------------------------------------------------|
  | ![ new application](../dega/images/CreateApplication.png)               | ![ new application token](../dega/images/application_token.png)     |
  | ![ applications](../dega/images/application_list.png) |  |

## Dega

Dega is a lightweight, scalable & high performant open-source publishing platform for small and medium scale news media organizations. The platform has various features built-in for fact-checking organizations. Dega supports managing multiple organizations and sites from the same portal. It is developed for modern web features with all the publishing best practices built-in. The tool is written in Go & React.

### To access application

Dega: [http://127.0.0.1:4455/.factly/dega/studio/](http://127.0.0.1:4455/.factly/dega/studio/)


When super organisation is enabled then other organisations have to make request for organisation and space to super organisation. One request is for organisation where you request for number of spaces required. Once organisation request approved then spaces can be created. And we have to make space request to enable service like fact checking, podcast.

If super organisation is disabled. Space can be created directly without any requests. 

#### Space
- An organisation can have multiple spaces.

  |      |    |
  |------------------------------------------------|------------------------------------------------------|
  | ![ new space](../dega/images/create_space.png)               | ![ spaces](../dega/images/spaces.png)     |

### Features 
  - Core 
      - Posts
      - Pages
      - Categories
      - Tags
      - Media
      - Formats
      - Menu
  - Fact Checking
      - Fact Checks
      - Claims
      - Ratings
      - Google
  - Podcast
      - Episodes

### Default Features

1)  Ratings :- Five ratings (True, Partly True, Misleading, Partly False and False) will be created. 
2)  Formats :- Two formats ( Article & Fact Check ) will be created. As of now to create posts and factchecks these are formats are required. 
3)  Policies :- Three policies (Editor, Author and Contributor) will be created. 
4)  Events :- Events for all entites will be created. Events can be only created by Super organisation admins.

|      |    |
|------------------------------------------------|------------------------------------------------------|
| ![ Default features](../dega/images/default_features.png)               |

- Ratings

|      |    |
|------------------------------------------------|------------------------------------------------------|
| ![ ratings](../dega/images/ratings.png)               |

- Formats

|      |    |
|------------------------------------------------|------------------------------------------------------|
| ![ formats](../dega/images/formats.png)               |

- Policies

|      |    |
|------------------------------------------------|------------------------------------------------------|
| ![ policies](../dega/images/policies.png)               |

#### Post

|      |    |
|------------------------------------------------|------------------------------------------------------|
| ![ new Post](../dega/images/create_post.png) |  ![ post settings](../dega/images/post_settings.png)              |
| ![ post embed](../dega/images/post_embed.png) |  ![ post image](../dega/images/post_image_uploader.png)              |
| ![ post embed](../dega/images/posts.png) |  |

#### Fact Checks
|      |    |
|------------------------------------------------|------------------------------------------------------|
| ![ new Fact check](../dega/images/fact-check.png) |   ![ Fact checks](../dega/images/fact-checks.png)           |


### Stopping the application

- Execute the following command docker-compose command to stop Dega and all the components

  ```
    docker-compose down
  ```

### Env files to be added

- Create config file with name config (and extension .env, .yml, .json) in `server/`, `api/` and `templates/` add config variables (for eg see config.env.example in each folder)
- Create a `.env` file inside companion folder in root for companion config variables (for eg see .env.example file in companion folder)
