package episode

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/permissions/space"
	"github.com/factly/dega-server/test/service/podcast"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestEpisodeList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of episodes", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock)
		CountQuery(mock, 0)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})

		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of episodes", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock)
		CountQuery(mock, 1)

		SelectQuery(mock, 1)
		medium.SelectWithOutSpace(mock)
		podcast.SelectQuery(mock)
		podcast.PodcastCategorySelect(mock)
		medium.SelectWithOutSpace(mock)
		category.SelectWithOutSpace(mock)

		EpisodeAuthorSelect(mock)

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 1}).
			Value("nodes").Array().Element(0).Object().
			ContainsMap(resData)

		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of episodes with search query", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock)
		CountQuery(mock, 1)

		SelectQuery(mock, 1, sqlmock.AnyArg(), sqlmock.AnyArg())
		medium.SelectWithOutSpace(mock)
		podcast.SelectQuery(mock)
		podcast.PodcastCategorySelect(mock)
		medium.SelectWithOutSpace(mock)
		category.SelectWithOutSpace(mock)

		EpisodeAuthorSelect(mock)

		e.GET(basePath).
			WithHeaders(headers).
			WithQuery("q", "test").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 1}).
			Value("nodes").Array().Element(0).Object().
			ContainsMap(resData)

		test.ExpectationsMet(t, mock)
	})

}
