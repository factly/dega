# Dega Server

**Releasability:** [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=alert_status)](https://sonarcloud.io/dashboard?id=factly_dega-server)  
**Reliability:** [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=bugs)](https://sonarcloud.io/dashboard?id=factly_dega-server)  
**Security:** [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=security_rating)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=factly_dega-server)  
**Maintainability:** [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=sqale_index)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=code_smells)](https://sonarcloud.io/dashboard?id=factly_dega-server)  
**Other:** [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=ncloc)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=coverage)](https://sonarcloud.io/dashboard?id=factly_dega-server)  


## Configurable variables 
```
DATABASE_HOST=postgres 
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=dega 
DATABASE_PORT=5432 
DATABASE_SSL_MODE=disable
MODE=development
OATHKEEPER_HOST=oathkeeper:4455
ENABLE_HUKZ=true
NATS_URL=nats://nats:4222
NATS_USER_NAME=natsuser
NATS_USER_PASSWORD=natspassword
HUKZ_URL=http://hukz:7790

KAVACH_URL=http://kavach-server:8000
IMAGEPROXY_URL=http://127.0.0.1:7001
KETO_URL=http://keto:4466
KRATOS_PUBLIC_URL=http://kratos:4433
IFRAMELY_URL=http://iframely:8061
GOOGLE_KEY=<google api key for google factchecks>
TEMPLATES_PATH=web/templates

MEILI_URL=http://meilisearch:7700
MEILI_KEY=<meilisearch server key>

CREATE_SUPER_ORGANISATION=true
SUPER_ORGANISATION_TITLE=<title of super organisation>
DEFAULT_NUMBER_OF_MEDIA=10
DEFAULT_NUMBER_OF_SPACES=2
DEFAULT_NUMBER_OF_POSTS=10
DEFAULT_NUMBER_OF_EPISODES=10
DEFAULT_USER_EMAIL=<super user email>
DEFAULT_USER_PASSWORD=<super user password>
```
* Config file should be stored in project root folder with name config (ext can be yml, json, env)
* Environment variables can also be set for configuration.

> If running in docker, swagger docs can be accessed at `http://localhost:7789/swagger/index.html` 

## Tests

To run test cases
  `go test ./test/... -coverpkg ./service/... -coverprofile=coverage.out`

To watch the test results display in your browser:
  `go tool cover -html=coverage.out`
To check the coverage run: `go tool cover -func={path/to/coverage.out}`
