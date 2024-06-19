package rating

import (
	"log"
	"os"
	"testing"

	"github.com/factly/dega-server/test"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	test.MockServer()
	test.SetupSqlite("./rating.db")
	defer gock.DisableNetworking()
	exitValue := m.Run()
	if err := os.Remove("./rating.db"); err != nil {
		log.Fatal(err)
	}
	os.Exit(exitValue)
}
