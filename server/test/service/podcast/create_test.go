package podcast

import (
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

func TestPodcastCreate(t *testing.T) {

	mock := test.SetupMockDB()
	viper.Set("templates_path", "../../../web/templates/*")

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable podcast", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("Undecodable podcast", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("Podcast with same name exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		mock.ExpectQuery(countQuery).
			WithArgs(1, strings.ToLower(Data["title"].(string))).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(1))

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("Create podcast", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		mock.ExpectQuery(countQuery).
			WithArgs(1, strings.ToLower(Data["title"].(string))).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(0))

		slugCheckMock(mock, Data)
		category.SelectWithOutSpace(mock)
		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories"`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(category.Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["parent_id"], category.Data["meta_fields"], category.Data["medium_id"], category.Data["is_featured"], 1))

		mock.ExpectQuery(`INSERT INTO "podcasts"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["title"], Data["slug"], Data["description"], Data["html_description"], Data["language"], Data["primary_category_id"], Data["medium_id"], 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"medium_id", "id", "primary_category_id"}).
				AddRow(1, 1, 1))

		podcastCategoriesInsert(mock)

		SelectQuery(mock)
		PodcastCategorySelect(mock)
		medium.SelectWithOutSpace(mock)
		category.SelectWithOutSpace(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated)
		test.ExpectationsMet(t, mock)
	})

	t.Run("cannot parse podcast description", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		mock.ExpectQuery(countQuery).
			WithArgs(1, strings.ToLower(Data["title"].(string))).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(0))
		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"block": "new"}`),
		}
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		}
		test.ExpectationsMet(t, mock)
	})

}
