package podcast

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
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestPodcastDetails(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid podcast id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		e.GET(path).
			WithPath("podcast_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
		test.ExpectationsMet(t, mock)
	})

	t.Run("podcast record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.GET(path).
			WithPath("podcast_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("fetch podcast by id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectQuery(mock, 1, 1)

		PodcastCategorySelect(mock)
		PodcastEpisodeSelect(mock)
		medium.SelectWithOutSpace(mock)
		category.SelectWithOutSpace(mock)

		e.GET(path).
			WithPath("podcast_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)
	})
}
