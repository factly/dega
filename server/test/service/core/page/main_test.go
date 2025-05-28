package page

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factCheckModels "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/test"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	test.MockServer()
	test.SetupSqlite("./page.db")
	config.DB.AutoMigrate(&model.Post{}, &model.Author{}, &model.Medium{}, &model.Format{}, &model.PostAuthor{}, &factCheckModels.PostClaim{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./page.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
