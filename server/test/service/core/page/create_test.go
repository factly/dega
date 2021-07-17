package page

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/format"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/tag"
	"github.com/gavv/httpexpect"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestPageCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable post", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("Undecodable post", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("parsing html description fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"invalid":"block"}`),
		}
		e.POST(basePath).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

		Data["description"] = postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		}
	})

	t.Run("create page", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)
		tag.SelectMock(mock, tag.Data, 1)
		category.SelectWithOutSpace(mock)

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)
		mock.ExpectQuery(`INSERT INTO "posts"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["title"], Data["subtitle"], Data["slug"], Data["status"], Data["is_page"], Data["excerpt"], Data["description"], Data["html_description"], Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], Data["format_id"], nil, 1, nil, Data["featured_medium_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"featured_medium_id", "id"}).
				AddRow(1, 1))

		mock.ExpectQuery(`INSERT INTO "tags"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, tag.Data["name"], tag.Data["slug"], tag.Data["description"], tag.Data["html_description"], tag.Data["is_featured"], 1, 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectExec(`INSERT INTO "post_tags"`).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		medium.SelectWithSpace(mock)

		mock.ExpectQuery(`INSERT INTO "categories"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["is_featured"], sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.
				NewRows([]string{"id", "parent_id", "medium_id"}).
				AddRow(1, 1, 1))

		mock.ExpectExec(`INSERT INTO "post_categories"`).
			WithArgs(1, 1).
			WillReturnResult(sqlmock.NewResult(0, 1))

		SelectMock(mock)
		preloadMock(mock)

		pageAuthorInsertMock(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().ContainsMap(pageData)
		test.ExpectationsMet(t, mock)
	})

}
