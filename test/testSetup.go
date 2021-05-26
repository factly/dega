package test

import (
	"log"
	"net/http"
	"regexp"
	"testing"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/resolvers"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/gavv/httpexpect/v2"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var path string = "/query"
var headers map[string]string = map[string]string{
	"X-Space":       "1",
	"Authorization": "Basic MjQzMDlkMGY0NmNmMjlmODFkOTgzMzYzMGVlZGZlYTNlOTIzYmQyNjYwMmY0Y2NmNGRmOTcwNDZiYjEzODA0YTokMmEkMTAkdS5vVGRVWHA3OElrZnRqaXp6enIxZWpRU2E2TDJxaWpXSy9Nd2k1LlBzTVhWclFaVnNoSEc=",
}

type Query struct {
	Query         string                 `json:"query"`
	Variables     map[string]interface{} `json:"variables"`
	OperationName interface{}            `json:"operationName"`
}

func CheckJSON(obj *httpexpect.Object, data interface{}, qry string) {
	obj.ContainsMap(map[string]interface{}{
		"data": map[string]interface{}{
			qry: data,
		},
	})
}

func TestRouter() http.Handler {

	router := chi.NewRouter()

	router.Use(middleware.RequestID)
	router.Use(loggerx.Init())
	router.Use(validator.CheckSpace())
	router.Use(middleware.RealIP)

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &resolvers.Resolver{}}))

	router.With(validator.CheckSpace(), validator.CheckOrganisation(), middlewarex.ValidateAPIToken("dega", validator.GetOrganisation)).Handle("/query", loaders.DataloaderMiddleware(srv))

	return router
}

func SetupMockDB() sqlmock.Sqlmock {
	db, mock, err := sqlmock.New()
	if err != nil {
		log.Println(err)
	}

	dialector := postgres.New(postgres.Config{
		DSN:                  "sqlmock_db_0",
		DriverName:           "postgres",
		Conn:                 db,
		PreferSimpleProtocol: true,
	})

	config.DB, err = gorm.Open(dialector, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Println(err)
	}

	viper.Set("enable_cache", false)

	return mock
}

// ExpectationsMet checks if all the expectations are fulfilled
func ExpectationsMet(t *testing.T, mock sqlmock.Sqlmock) {
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func CheckSpaceMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "spaces"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"organisation_id", "slug", "space_id"}).AddRow(1, "test-space", "1"))
}

var Dummy_AuthorList = []map[string]interface{}{
	{
		"id":         1,
		"created_at": time.Now(),
		"updated_at": time.Now(),
		"deleted_at": nil,
		"email":      "abc@abc.com",
		"kid":        "",
		"first_name": "abc",
		"last_name":  "cba",
		"medium": map[string]interface{}{
			"id": 1,
		},
		"birth_date": time.Now(),
		"gender":     "male",
		"permission": map[string]interface{}{
			"id":              1,
			"created_at":      time.Now(),
			"updated_at":      time.Now(),
			"deleted_at":      nil,
			"user_id":         1,
			"user":            nil,
			"organisation_id": 1,
			"organisation":    nil,
			"role":            "owner",
		},
	},
	{
		"id":         2,
		"created_at": time.Now(),
		"updated_at": time.Now(),
		"deleted_at": nil,
		"email":      "def@def.com",
		"kid":        "",
		"first_name": "def",
		"last_name":  "fed",
		"birth_date": time.Now(),
		"medium": map[string]interface{}{
			"id": 1,
		},
		"gender": "male",
		"permission": map[string]interface{}{
			"id":              2,
			"created_at":      time.Now(),
			"updated_at":      time.Now(),
			"deleted_at":      nil,
			"user_id":         2,
			"user":            nil,
			"organisation_id": 1,
			"organisation":    nil,
			"role":            "member",
		},
	},
}

var AuthorPaging = map[string]interface{}{
	"nodes": Dummy_AuthorList,
	"total": len(Dummy_AuthorList),
}

func KavachMockServer() {
	viper.Set("kavach_url", "http://kavach:8000")
	gock.New(viper.GetString("kavach_url") + "/organisations/[0-9]+/users").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_AuthorList)

	gock.New(viper.GetString("kavach_url") + "/users/application?application=dega").
		Persist().
		Reply(http.StatusOK).
		JSON(AuthorPaging)

	gock.New(viper.GetString("kavach_url") + "/applications/dega/validateToken").
		Persist().
		Reply(http.StatusOK)
}
