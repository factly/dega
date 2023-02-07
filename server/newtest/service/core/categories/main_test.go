package categories

import (
	"os"
	"testing"

	"github.com/factly/dega-server/newtest"
	"gopkg.in/h2non/gock.v1"
)

func TestMain(m *testing.M) {
	defer gock.Disable()
	newtest.MockServer()
	SetupDB()
	defer gock.DisableNetworking()

	exitValue := m.Run()

	os.Exit(exitValue)
}
