package author

import (
	"fmt"
	"os"
	"testing"

	"github.com/factly/dega-server/test"
	"gopkg.in/h2non/gock.v1"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var missingSpace = map[string]string{
	"X-User": "1",
}

var missingUser = map[string]string{
	"X-Space": "1",
}

var basePath = "/core/authors"

func TestMain(m *testing.M) {

	test.SetEnv()

	// Mock kavach server and allowing persisted external traffic
	defer gock.Disable()
	test.MockServer()
	defer gock.DisableNetworking()
	fmt.Print("running")
	exitValue := m.Run()
	fmt.Print("end")
	os.Exit(exitValue)
}
