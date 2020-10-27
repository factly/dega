package space

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/gavv/httpexpect"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestSpaceMy(t *testing.T) {
	mock := test.SetupMockDB()

	defer gock.Disable()
	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get my spaces", func(t *testing.T) {
		SelectQuery(mock, 1)

		medium.SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)

		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Element(0).
			Object().
			Value("spaces").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid space header", func(t *testing.T) {
		e.GET(basePath).
			WithHeader("X-User", "invalid").
			Expect().
			Status(http.StatusUnauthorized)
	})

	t.Run("when keto is down", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)
		SelectQuery(mock, 1)

		medium.SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)

		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("when kavach is down", func(t *testing.T) {
		test.DisableKavachGock(testServer.URL)

		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusServiceUnavailable)
	})

	t.Run("when member requests his spaces", func(t *testing.T) {
		test.DisableKavachGock(testServer.URL)
		SelectQuery(mock, 1)

		medium.SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)
		medium.SelectWithOutSpace(mock)

		gock.New(viper.GetString("kavach.url") + "/organisations/my").
			Persist().
			Reply(http.StatusOK).
			JSON(test.Dummy_Org_Member_List)

		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK)
	})

}
