package test

import (
	"database/sql/driver"
	"log"
	"regexp"
	"testing"
	"time"

	"github.com/factly/dega-server/service/fact-check/action/google"
	"github.com/factly/dega-server/util/meili"
	"github.com/meilisearch/meilisearch-go"
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

	viper.Set("kavach.url", "http://kavach:6620")
	viper.Set("keto.url", "http://keto:6644")
	viper.Set("meili.url", "http://meili:7700")
	viper.Set("meili.key", "password")
	viper.Set("imageproxy.url", "http://imageproxy")
	google.GoogleURL = "http://googlefactchecktest.com"

	meili.Client = meilisearch.NewClient(meilisearch.Config{
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
