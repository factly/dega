package tag

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
	test.SetupSqlite("./tag.db")
	config.DB.AutoMigrate(&model.Tag{}, &model.Medium{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./tag.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
