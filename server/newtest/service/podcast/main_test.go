package podcast

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/newtest"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	newtest.MockServer()
	newtest.SetupSqlite("./podcast.db")
	config.DB.AutoMigrate(&model.Podcast{}, &coreModel.Medium{}, &coreModel.SpacePermission{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./podcast.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
