package policy

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestPolicyDelete(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	e := httpexpect.New(t, testServer.URL)

	t.Run("delete policy", func(t *testing.T) {
		e.DELETE(path).
			WithPath("policy_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})
}
