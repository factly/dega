package post

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/format"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/tag"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestPostTemplateCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	Data["status"] = "template"
	t.Run("Create a template from post", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		postSelectWithSpace(mock)

		// preload tags & categories
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM  "tags" INNER JOIN "post_tags"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append(tag.Columns, []string{"tag_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "title1", "slug1", 1, 1, 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories" INNER JOIN "post_categories"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append(category.Columns, []string{"category_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "description", 0, 1, 1, 1, 1))

		postInsertMock(mock, Data)

		postSelectWithOutSpace(mock, Data)

		mock.ExpectCommit()

		e.POST(templatePath).
			WithHeaders(headers).
			WithPath("post_id", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusOK)

		test.ExpectationsMet(t, mock)

	})

	t.Run("post record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(columns))

		e.POST(templatePath).
			WithHeaders(headers).
			WithPath("post_id", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("cannot create template", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		postSelectWithSpace(mock)

		// preload tags & categories
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM  "tags" INNER JOIN "post_tags"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append(tag.Columns, []string{"tag_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "title1", "slug1", 1, 1, 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories" INNER JOIN "post_categories"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append(category.Columns, []string{"category_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "description", 0, 1, 1, 1, 1))

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		format.SelectWithSpace(mock)

		mock.ExpectQuery(`INSERT INTO "posts"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["title"], Data["subtitle"], Data["slug"], Data["status"], Data["excerpt"],
				Data["description"], Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], Data["featured_medium_id"], Data["format_id"], test.AnyTime{}, 1).
			WillReturnError(errors.New("cannot create post"))
		mock.ExpectRollback()

		e.POST(templatePath).
			WithHeaders(headers).
			WithPath("post_id", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("create template when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		postSelectWithSpace(mock)

		// preload tags & categories
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM  "tags" INNER JOIN "post_tags"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append(tag.Columns, []string{"tag_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "title1", "slug1", 1, 1, 1))
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories" INNER JOIN "post_categories"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(append(category.Columns, []string{"category_id", "post_id"}...)).
				AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "description", 0, 1, 1, 1, 1))

		postInsertMock(mock, Data)

		postSelectWithOutSpace(mock, Data)

		mock.ExpectRollback()

		e.POST(templatePath).
			WithHeaders(headers).
			WithPath("post_id", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})
	Data["status"] = "draft"
}
