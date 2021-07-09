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

func TestEpisodeDetail(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid episode id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock)
		e.GET(path).
			WithPath("episode_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
		test.ExpectationsMet(t, mock)
	})

	t.Run("episode record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.GET(path).
			WithPath("episode_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("get episode details", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock)
		SelectQuery(mock, 1, 1)
		medium.SelectWithOutSpace(mock)
		podcast.SelectQuery(mock)
		podcast.PodcastCategorySelect(mock)
		medium.SelectWithOutSpace(mock)
		category.SelectWithOutSpace(mock)

		EpisodeAuthorSelect(mock)

		e.GET(path).
			WithPath("episode_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().Object().
			ContainsMap(resData)
		test.ExpectationsMet(t, mock)
	})
}
