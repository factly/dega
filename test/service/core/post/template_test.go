package post

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

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
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_categories"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"post_id", "category_id"}).
				AddRow(1, 1))
		category.SelectWithOutSpace(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_tags"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"post_id", "tag_id"}).
				AddRow(1, 1))
		tag.SelectMock(mock, tag.Data, 1)

		postInsertMock(mock, Data, false)

		postSelectWithOutSpace(mock, Data)

		mock.ExpectCommit()

		e.POST(templatePath).
			WithHeaders(headers).
			WithJSON(templateData).
			Expect().
			Status(http.StatusOK)

		test.ExpectationsMet(t, mock)

	})

	t.Run("invalid template data body", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.POST(templatePath).
			WithHeaders(headers).
			WithJSON(invalidTemplateData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("undecodable template data body", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.POST(templatePath).
			WithHeaders(headers).
			WithJSON(undecodableTemplateData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("post record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(columns))

		e.POST(templatePath).
			WithHeaders(headers).
			WithJSON(templateData).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("cannot create template", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		postSelectWithSpace(mock)

		// preload tags & categories
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_categories"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"post_id", "category_id"}).
				AddRow(1, 1))
		category.SelectWithOutSpace(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_tags"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"post_id", "tag_id"}).
				AddRow(1, 1))
		tag.SelectMock(mock, tag.Data, 1)

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		format.SelectMock(mock, 1, 1)

		mock.ExpectQuery(`INSERT INTO "posts"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Data["title"], Data["subtitle"], Data["slug"], Data["status"], Data["page"], Data["excerpt"], Data["description"], Data["html_description"], Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], Data["format_id"], nil, 1, Data["featured_medium_id"]).
			WillReturnError(errors.New("cannot create post"))
		mock.ExpectRollback()

		e.POST(templatePath).
			WithHeaders(headers).
			WithJSON(templateData).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("create template when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		postSelectWithSpace(mock)

		// preload tags & categories
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_categories"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"post_id", "category_id"}).
				AddRow(1, 1))
		category.SelectWithOutSpace(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_tags"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"post_id", "tag_id"}).
				AddRow(1, 1))
		tag.SelectMock(mock, tag.Data, 1)

		postInsertMock(mock, Data, false)

		postSelectWithOutSpace(mock, Data)

		mock.ExpectRollback()

		e.POST(templatePath).
			WithHeaders(headers).
			WithJSON(templateData).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})
	Data["status"] = "draft"
}
