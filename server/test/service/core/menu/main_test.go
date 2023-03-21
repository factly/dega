package menu

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/test"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	test.MockServer()
	test.SetupSqlite("./menu.db")
	config.DB.AutoMigrate(&model.Menu{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./menu.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
