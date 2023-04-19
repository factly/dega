package episode

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/config"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/dega-server/test"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	test.MockServer()
	test.SetupSqlite("./podcast.db")
	config.DB.AutoMigrate(&model.Podcast{}, &model.Episode{}, &coreModel.Medium{}, &coreModel.SpacePermission{}, &coreModel.Author{}, &model.EpisodeAuthor{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./podcast.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
