package rating

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/newtest"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/fact-check/model"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	newtest.MockServer()
	newtest.SetupSqlite("./rating.db")
	config.DB.AutoMigrate(&model.Rating{}, &coreModel.SpacePermission{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./rating.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
