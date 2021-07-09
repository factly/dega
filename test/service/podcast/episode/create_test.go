package episode

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/permissions/space"
	"github.com/factly/dega-server/test/service/podcast"
	"github.com/gavv/httpexpect"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestEpisodeCreate(t *testing.T) {

	mock := test.SetupMockDB()
	viper.Set("templates_path", "../../../../web/templates/*")

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable episode", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("Undecodable episode", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("cannot parse episode description", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		Data["description"] = postgres.Jsonb{RawMessage: []byte(`{"raw":"test"}`)}

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		}
	})

	t.Run("create episode", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		slugCheckMock(mock, Data)

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		podcast.SelectQuery(mock)
		mock.ExpectQuery(`INSERT INTO "episodes"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["title"], Data["slug"], Data["season"], Data["episode"], Data["audio_url"], Data["podcast_id"], Data["description"], Data["html_description"], test.AnyTime{}, 1, Data["medium_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"medium_id", "id"}).
				AddRow(1, 1))

		mock.ExpectQuery(`INSERT INTO "episode_authors"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 0, 0, 1, 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		SelectQuery(mock)
		medium.SelectWithOutSpace(mock)
		podcast.SelectQuery(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().ContainsMap(resData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("create episode when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		slugCheckMock(mock, Data)

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		podcast.SelectQuery(mock)
		mock.ExpectQuery(`INSERT INTO "episodes"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["title"], Data["slug"], Data["season"], Data["episode"], Data["audio_url"], Data["podcast_id"], Data["description"], Data["html_description"], test.AnyTime{}, 1, Data["medium_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"medium_id", "id"}).
				AddRow(1, 1))

		mock.ExpectQuery(`INSERT INTO "episode_authors"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 0, 0, 1, 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		SelectQuery(mock)
		medium.SelectWithOutSpace(mock)
		podcast.SelectQuery(mock)
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

}
