package meta

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/newtest"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	newtest.MockServer()
	newtest.SetupSqlite("./meta.db")
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./meta.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
