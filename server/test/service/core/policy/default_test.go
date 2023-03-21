package policy

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/action/policy"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCreateDefaultPolicy(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	policy.PolicyDataFile = "../../../../data/policies.json"
	policy.RolesDataFile = "../../../../data/roles.json"

	e := httpexpect.New(t, testServer.URL)

	t.Run("create default policies", func(t *testing.T) {
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated)
	})

	t.Run("when cannot open data file", func(t *testing.T) {
		policy.PolicyDataFile = "nofile.json"
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("when cannot parse data file", func(t *testing.T) {
		policy.PolicyDataFile = "invalidData.json"
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})
}
