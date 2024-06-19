package claim

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/config"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/test"

	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	test.MockServer()
	test.SetupSqlite("./claim.db")
	config.DB.AutoMigrate(&model.Claim{}, &model.Claimant{}, &coreModel.Medium{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./claim.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
