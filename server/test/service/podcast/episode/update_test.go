package episode

import (
	"database/sql/driver"
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

func TestEpisodeUpdate(t *testing.T) {
	mock := test.SetupMockDB()
	viper.Set("templates_path", "../../../../web/templates/*")

	test.MockServer()
	gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid episode id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		e.PUT(path).
			WithPath("episode_id", "invalid_id").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
		test.ExpectationsMet(t, mock)
	})

	t.Run("unprocessable episode", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		e.PUT(path).
			WithPath("episode_id", "1").
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("undecodable episode", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		e.PUT(path).
			WithPath("episode_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("episode record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("episode_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("parsing description fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		SelectQuery(mock, 1, 1)

		Data["description"] = postgres.Jsonb{RawMessage: []byte(`{"raw":"test"}`)}

		e.PUT(path).
			WithPath("episode_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		}
	})

	t.Run("update episode", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		SelectQuery(mock, 1, 1)

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		podcast.SelectQuery(mock)
		mock.ExpectExec(`UPDATE "episodes" SET`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, 1).WillReturnResult(driver.ResultNoRows)

		slugCheckMock(mock, Data)
		medium.SelectWithSpace(mock)
		podcast.SelectQuery(mock)
		mock.ExpectExec(`UPDATE "episodes" SET`).
			WithArgs(test.AnyTime{}, 1, Data["title"], Data["slug"], Data["season"], Data["episode"], Data["audio_url"], Data["podcast_id"], Data["description"], Data["html_description"], Data["medium_id"], 1, 1).WillReturnResult(driver.ResultNoRows)

		SelectQuery(mock)
		medium.SelectWithOutSpace(mock)
		podcast.SelectQuery(mock)
		medium.SelectWithOutSpace(mock)
		mock.ExpectQuery(`SELECT \* FROM "episode_authors"`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"episode_id", "author_id"}).AddRow(1, 1))

		mock.ExpectQuery(`SELECT \* FROM "episode_authors"`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"episode_id", "author_id"}).AddRow(1, 1))
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("episode_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().
			ContainsMap(resData)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update episode when medium_id = 0", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		SelectQuery(mock, 1, 1)

		mock.ExpectBegin()
		podcast.SelectQuery(mock)
		mock.ExpectExec(`UPDATE "episodes" SET`).
			WithArgs(nil, test.AnyTime{}, 1).WillReturnResult(driver.ResultNoRows)
		podcast.SelectQuery(mock)

		mock.ExpectExec(`UPDATE "episodes" SET`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, 1).WillReturnResult(driver.ResultNoRows)

		slugCheckMock(mock, Data)
		podcast.SelectQuery(mock)
		mock.ExpectExec(`UPDATE "episodes" SET`).
			WithArgs(test.AnyTime{}, 1, Data["title"], Data["slug"], Data["season"], Data["episode"], Data["audio_url"], Data["podcast_id"], Data["description"], Data["html_description"], 1, 1).WillReturnResult(driver.ResultNoRows)

		SelectQuery(mock)
		medium.SelectWithOutSpace(mock)
		podcast.SelectQuery(mock)
		medium.SelectWithOutSpace(mock)
		mock.ExpectQuery(`SELECT \* FROM "episode_authors"`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"episode_id", "author_id"}).AddRow(1, 1))

		mock.ExpectQuery(`SELECT \* FROM "episode_authors"`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"episode_id", "author_id"}).AddRow(1, 1))
		mock.ExpectCommit()

		Data["medium_id"] = 0
		e.PUT(path).
			WithPath("episode_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().
			ContainsMap(resData)
		test.ExpectationsMet(t, mock)
		Data["medium_id"] = 1
	})

	t.Run("update episode when podcast_id = 0", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		SelectQuery(mock, 1, 1)

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE "episodes" SET`).
			WithArgs(nil, test.AnyTime{}, 1).WillReturnResult(driver.ResultNoRows)

		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE "episodes" SET`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, 1).WillReturnResult(driver.ResultNoRows)

		slugCheckMock(mock, Data)
		medium.SelectWithSpace(mock)
		mock.ExpectExec(`UPDATE "episodes" SET`).
			WithArgs(test.AnyTime{}, 1, Data["title"], Data["slug"], Data["season"], Data["episode"], Data["audio_url"], Data["description"], Data["html_description"], Data["medium_id"], 1, 1).WillReturnResult(driver.ResultNoRows)

		SelectQuery(mock)
		medium.SelectWithOutSpace(mock)
		podcast.SelectQuery(mock)
		medium.SelectWithOutSpace(mock)
		mock.ExpectQuery(`SELECT \* FROM "episode_authors"`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"episode_id", "author_id"}).AddRow(1, 1))

		mock.ExpectQuery(`SELECT \* FROM "episode_authors"`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"episode_id", "author_id"}).AddRow(1, 1))
		mock.ExpectCommit()

		Data["podcast_id"] = 0
		e.PUT(path).
			WithPath("episode_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().
			ContainsMap(resData)
		test.ExpectationsMet(t, mock)
		Data["podcast_id"] = 1

	})

	t.Run("creating episode author fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		SelectQuery(mock, 1, 1)

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		podcast.SelectQuery(mock)
		mock.ExpectExec(`UPDATE "episodes" SET`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, 1).WillReturnResult(driver.ResultNoRows)

		slugCheckMock(mock, Data)
		medium.SelectWithSpace(mock)
		podcast.SelectQuery(mock)
		mock.ExpectExec(`UPDATE "episodes" SET`).
			WithArgs(test.AnyTime{}, 1, Data["title"], Data["slug"], Data["season"], Data["episode"], Data["audio_url"], Data["podcast_id"], Data["description"], Data["html_description"], Data["medium_id"], 1, 1).WillReturnResult(driver.ResultNoRows)

		SelectQuery(mock)
		medium.SelectWithOutSpace(mock)
		podcast.SelectQuery(mock)
		medium.SelectWithOutSpace(mock)
		mock.ExpectQuery(`SELECT \* FROM "episode_authors"`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"episode_id", "author_id"}).AddRow(1, 2))

		mock.ExpectExec(`UPDATE "episode_authors" SET`).
			WithArgs(test.AnyTime{}, 2).WillReturnResult(driver.ResultNoRows)

		mock.ExpectQuery(`INSERT INTO "episode_authors"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 0, 0, 1, 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectQuery(`SELECT \* FROM "episode_authors"`).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"episode_id", "author_id"}).AddRow(1, 1))
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("episode_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().
			ContainsMap(resData)
		test.ExpectationsMet(t, mock)
	})

}
