package post

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/newtest"
	"github.com/factly/dega-server/service/core/model"
	factCheckModels "github.com/factly/dega-server/service/fact-check/model"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	newtest.MockServer()
	newtest.SetupSqlite("./post.db")
	config.DB.AutoMigrate(&model.SpacePermission{}, &model.SpaceSettings{}, &model.Post{}, &model.Author{}, &model.Medium{}, &model.Format{}, &model.PostAuthor{}, &factCheckModels.PostClaim{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./post.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}