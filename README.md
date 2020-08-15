# HOW TO TEST:
- Ensure postgres is set up and running in your local setup
- Create a database named dega in postgres. (This shall be automated soon).
- Add an .env file to the root directory with the following data
  ```
  DSN=postgres://postgres:postgres@localhost:5432/dega?sslmode=disable
  KAVACH_URL=http://127.0.0.1:6620
  KETO_URL=http://127.0.0.1:4466
  PORT=8820
  ENVIRONMENT_NAME=development
  ```
- Go to the directory where tests reside (tags in this case)
  ```bash
  cd service/core/action/tag
  ```
- Run the test command:
  ```go
  go test -v
  ```
