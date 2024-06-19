package claimant

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
	test.SetupSqlite("./claimant.db")
	config.DB.AutoMigrate(&model.Claimant{}, &coreModel.Medium{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./claimant.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
