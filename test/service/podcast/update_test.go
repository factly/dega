package podcast

import (
	"database/sql/driver"
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/permissions/space"
	"github.com/gavv/httpexpect"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestPodcastUpdate(t *testing.T) {
	mock := test.SetupMockDB()
	viper.Set("templates_path", "../../../web/templates/*")

	test.MockServer()
	gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid podcast id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		e.PUT(path).
			WithPath("podcast_id", "invalid_id").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
		test.ExpectationsMet(t, mock)
	})

	t.Run("podcast record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("podcast_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid podcast body", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		e.PUT(path).
			WithPath("podcast_id", "1").
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("undecodable podcast body", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		e.PUT(path).
			WithPath("podcast_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("podcast with same name already exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectQuery(mock)
		Data["title"] = "New Title"

		mock.ExpectQuery(countQuery).
			WithArgs(1, strings.ToLower(Data["title"].(string))).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(1))

		e.PUT(path).
			WithPath("podcast_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
		Data["title"] = "Test Podcast"
	})

	t.Run("cannot parse podcast description", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectQuery(mock)

		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"block": "new"}`),
		}
		e.PUT(path).
			WithPath("podcast_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		}
		test.ExpectationsMet(t, mock)
	})

	t.Run("updating categories fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectQuery(mock)

		mock.ExpectBegin()

		category.SelectWithOutSpace(mock)
		medium.SelectWithSpace(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(category.Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["parent_id"], category.Data["meta_fields"], category.Data["medium_id"], category.Data["is_featured"], 1))

		mock.ExpectExec(`UPDATE "podcasts" SET`).
			WithArgs(test.AnyTime{}, 1).WillReturnResult(driver.ResultNoRows)

		medium.SelectWithSpace(mock)
		mock.ExpectQuery(`INSERT INTO "categories"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["is_featured"], 1, category.Data["meta_fields"], sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnError(errors.New("cannot update categories"))
		mock.ExpectExec(`INSERT INTO "podcast_categories"`).
			WithArgs(1, 1).
			WillReturnError(errors.New("cannot update categories"))

		mock.ExpectRollback()

		e.PUT(path).
			WithPath("podcast_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("updating podcast", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectQuery(mock)

		mock.ExpectBegin()
		category.SelectWithOutSpace(mock)
		medium.SelectWithSpace(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(category.Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["parent_id"], category.Data["meta_fields"], category.Data["medium_id"], category.Data["is_featured"], 1))

		mock.ExpectExec(`UPDATE "podcasts" SET`).
			WithArgs(test.AnyTime{}, 1).WillReturnResult(driver.ResultNoRows)

		podcastCategoriesInsert(mock)
		mock.ExpectExec(`DELETE FROM "podcast_categories"`).
			WithArgs(1, 1).
			WillReturnResult(driver.ResultNoRows)

		slugCheckMock(mock, Data)
		medium.SelectWithSpace(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(category.Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["parent_id"], category.Data["meta_fields"], category.Data["medium_id"], category.Data["is_featured"], 1))

		mock.ExpectExec(`UPDATE \"podcasts\"`).
			WithArgs(test.AnyTime{}, 1, Data["slug"], Data["description"], Data["html_description"], Data["language"], Data["primary_category_id"], Data["medium_id"], 1, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		SelectQuery(mock)
		PodcastCategorySelect(mock)

		mock.ExpectCommit()
		e.PUT(path).
			WithPath("podcast_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})

	t.Run("updating podcast when medium_id = 0", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectQuery(mock)

		mock.ExpectBegin()
		category.SelectWithOutSpace(mock)
		medium.SelectWithSpace(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(category.Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["parent_id"], category.Data["meta_fields"], category.Data["medium_id"], category.Data["is_featured"], 1))

		mock.ExpectExec(`UPDATE "podcasts" SET`).
			WithArgs(test.AnyTime{}, 1).WillReturnResult(driver.ResultNoRows)

		podcastCategoriesInsert(mock)
		mock.ExpectExec(`DELETE FROM "podcast_categories"`).
			WithArgs(1, 1).
			WillReturnResult(driver.ResultNoRows)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(category.Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["parent_id"], category.Data["meta_fields"], category.Data["medium_id"], category.Data["is_featured"], 1))
		mock.ExpectExec(`UPDATE \"podcasts\"`).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		slugCheckMock(mock, Data)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(category.Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["parent_id"], category.Data["meta_fields"], category.Data["medium_id"], category.Data["is_featured"], 1))

		mock.ExpectExec(`UPDATE \"podcasts\"`).
			WithArgs(test.AnyTime{}, 1, Data["slug"], Data["description"], Data["html_description"], Data["language"], Data["primary_category_id"], 1, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		SelectQuery(mock)
		PodcastCategorySelect(mock)

		mock.ExpectCommit()

		Data["medium_id"] = 0
		e.PUT(path).
			WithPath("podcast_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
		Data["medium_id"] = 1
	})

	t.Run("updating podcast when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectQuery(mock)

		mock.ExpectBegin()
		category.SelectWithOutSpace(mock)
		medium.SelectWithSpace(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(category.Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["parent_id"], category.Data["meta_fields"], category.Data["medium_id"], category.Data["is_featured"], 1))

		mock.ExpectExec(`UPDATE "podcasts" SET`).
			WithArgs(test.AnyTime{}, 1).WillReturnResult(driver.ResultNoRows)

		podcastCategoriesInsert(mock)
		mock.ExpectExec(`DELETE FROM "podcast_categories"`).
			WithArgs(1, 1).
			WillReturnResult(driver.ResultNoRows)

		slugCheckMock(mock, Data)
		medium.SelectWithSpace(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(category.Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["parent_id"], category.Data["meta_fields"], category.Data["medium_id"], category.Data["is_featured"], 1))

		mock.ExpectExec(`UPDATE \"podcasts\"`).
			WithArgs(test.AnyTime{}, 1, Data["slug"], Data["description"], Data["html_description"], Data["language"], Data["primary_category_id"], Data["medium_id"], 1, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		SelectQuery(mock)
		PodcastCategorySelect(mock)

		mock.ExpectRollback()
		e.PUT(path).
			WithPath("podcast_id", "1").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)

	})
}
