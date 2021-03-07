package search

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestPostList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MeiliGock()
	test.KetoGock()
	test.KavachGock()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid space id in header", func(t *testing.T) {
		e.POST(path).
			WithHeaders(map[string]string{
				"X-User":  "1",
				"X-Space": "abc",
			}).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnauthorized)
	})

	t.Run("undecodable body", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.POST(path).
			WithHeaders(headers).
			WithJSON(undecodableData).
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid body", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.POST(path).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("search entities with query 'test'", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.POST(path).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})

	t.Run("meili server is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		e.POST(path).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})
}
