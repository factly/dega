package claim

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/newtest"
	"github.com/factly/dega-server/service/fact-check/model"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	newtest.MockServer()
	newtest.SetupSqlite("./claim.db")
	config.DB.AutoMigrate(&model.Claim{})
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./claim.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
