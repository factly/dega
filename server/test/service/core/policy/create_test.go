package policy

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestPolicyCreate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	e := httpexpect.New(t, testServer.URL)

	//create policy
	t.Run("create policy", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(policy_test).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"space_id": 1,
				"permissions": []map[string]interface{}{{
					"actions": []string{
						"get",
						"create",
						"update",
					},
					"resource": "posts",
				},
				},
				"name": "new policy",
			})
	})

	// undeceable policy body
	t.Run("undecodable policy body", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(undecodable_policy).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
}
