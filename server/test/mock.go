package test

import (
	"database/sql/driver"
	"log"
	"regexp"
	"testing"
	"time"

	"github.com/factly/dega-server/service/fact-check/action/google"
	"github.com/factly/x/meilisearchx"
	"github.com/meilisearch/meilisearch-go"
	"github.com/nats-io/gnatsd/server"
	gnatsd "github.com/nats-io/gnatsd/test"
	"github.com/nats-io/nats.go"
	"github.com/spf13/viper"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// AnyTime To match time for test sqlmock queries
type AnyTime struct{}

// Match satisfies sqlmock.Argument interface
func (a AnyTime) Match(v driver.Value) bool {
	_, ok := v.(time.Time)
	return ok
}

// SetupMockDB setups the mock sql db
func SetupMockDB() sqlmock.Sqlmock {

	viper.Set("kavach_url", "http://kavach:6620")
	viper.Set("keto_url", "http://keto:6644")
	viper.Set("meili_url", "http://meili:7700")
	viper.Set("meili_key", "password")
	viper.Set("imageproxy_url", "http://imageproxy")
	viper.Set("create_super_organisation", true)
	viper.Set("nats_url", "nats://127.0.0.1:4222")
	viper.Set("enable_hukz", false)
	viper.Set("enable_search_indexing", true)
	viper.Set("templates_path", "../../../../web/templates/*")
	google.GoogleURL = "http://googlefactchecktest.com"

	meilisearchx.Client = meilisearch.NewClient(meilisearch.ClientConfig{
		Host:   viper.GetString("meili_url"),
		APIKey: viper.GetString("meili_key"),
	})

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

	return mock
}

// RunDefaultNATSServer will run a nats server on the default port.
func RunDefaultNATSServer() *server.Server {
	return RunServerOnPort(nats.DefaultPort)
}

// RunServerOnPort will run a server on the given port.
func RunServerOnPort(port int) *server.Server {
	opts := gnatsd.DefaultTestOptions
	opts.Port = port
	return RunServerWithOptions(opts)
}

// RunServerWithOptions will run a server with the given options.
func RunServerWithOptions(opts server.Options) *server.Server {
	return gnatsd.RunServer(&opts)
}

// RunServerWithConfig will run a server with the given configuration file.
func RunServerWithConfig(configFile string) (*server.Server, *server.Options) {
	return gnatsd.RunServerWithConfig(configFile)
}

//ExpectationsMet checks if all the expectations are fulfilled
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
