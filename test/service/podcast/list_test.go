package podcast

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/permissions/space"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestPodcastList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of podcasts", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(0))

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

	t.Run("get list of podcasts", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(len(podcastList)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, podcastList[0]["title"], podcastList[0]["slug"], podcastList[0]["description"], podcastList[0]["html_description"], podcastList[0]["language"], podcastList[0]["primary_category_id"], podcastList[0]["medium_id"], 1).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, podcastList[1]["title"], podcastList[1]["slug"], podcastList[1]["description"], podcastList[1]["html_description"], podcastList[1]["language"], podcastList[1]["primary_category_id"], podcastList[1]["medium_id"], 1))

		PodcastCategorySelect(mock)
		medium.SelectWithOutSpace(mock)
		category.SelectWithOutSpace(mock)

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(podcastList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(podcastList[0])
	})

	t.Run("get list of podcasts with search query", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(len(podcastList)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, podcastList[0]["title"], podcastList[0]["slug"], podcastList[0]["description"], podcastList[0]["html_description"], podcastList[0]["language"], podcastList[0]["primary_category_id"], podcastList[0]["medium_id"], 1).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, podcastList[1]["title"], podcastList[1]["slug"], podcastList[1]["description"], podcastList[1]["html_description"], podcastList[1]["language"], podcastList[1]["primary_category_id"], podcastList[1]["medium_id"], 1))

		PodcastCategorySelect(mock)
		medium.SelectWithOutSpace(mock)
		category.SelectWithOutSpace(mock)

		e.GET(basePath).
			WithHeaders(headers).
			WithQuery("q", "test").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(podcastList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(podcastList[0])
	})
}
