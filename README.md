
# Dega Server

**Releasability:** [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=alert_status)](https://sonarcloud.io/dashboard?id=factly_dega-server)  
**Reliability:** [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=bugs)](https://sonarcloud.io/dashboard?id=factly_dega-server)  
**Security:** [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=security_rating)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=factly_dega-server)  
**Maintainability:** [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=sqale_index)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=code_smells)](https://sonarcloud.io/dashboard?id=factly_dega-server)  
**Other:** [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=ncloc)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=factly_dega-server) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=factly_dega-server&metric=coverage)](https://sonarcloud.io/dashboard?id=factly_dega-server)  


# Tests

To run test cases
  `go test ./test/... -coverpkg ./service/... -coverprofile=coverage.out`

To watch the test results display in your browser:
  `go tool cover -html=coverage.out`