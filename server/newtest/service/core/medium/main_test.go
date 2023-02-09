package medium

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/newtest"
	"github.com/factly/dega-server/service/core/model"
	fatchCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	newtest.MockServer()
	newtest.SetupSqlite("./media.db")
	config.DB.AutoMigrate(&model.Medium{}, &model.SpacePermission{}, &model.Post{}, &model.Category{} /*&model.SpaceSettings{},*/, &fatchCheckModel.Rating{}, &fatchCheckModel.Claimant{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./media.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)

}
