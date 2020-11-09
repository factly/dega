package meta

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestMetaDetails(t *testing.T) {
	mock := test.SetupMockDB()

	gock.New(siteUrl).
		Persist().
		Reply(http.StatusOK).
		SetHeader("Content-Type", "text/html").
		Body(strings.NewReader(page))

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get metadata for testsite", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		res := e.GET(path).
			WithQuery("url", siteUrl).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object()
		checkContents(res)
	})

	t.Run("request metadata without url", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.GET(path).
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("could not get webpage", func(t *testing.T) {
		gock.Off()
		test.CheckSpaceMock(mock)
		e.GET(path).
			WithHeaders(headers).
			WithQuery("url", siteUrl).
			Expect().
			Status(http.StatusInternalServerError)
	})
}
