package category

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCategoryDelete(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid category id", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		e.DELETE(path).
			WithPath("category_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)

		test.ExpectationsMet(t, mock)
	})

	t.Run("category record not found", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.DELETE(path).
			WithPath("category_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("delete a category", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		// selectWithSpace(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, newData.Name, newData.Slug, TestDescriptionJson, TestDescriptionHtml, newData.BackgroundColour, newData.ParentID, newData.MetaFields, newData.MediumID, newData.IsFeatured, 1, newData.Meta, newData.HeaderCode, newData.FooterCode))

		categoryPostAssociation(mock, 0)

		deleteMock(mock)
		mock.ExpectCommit()

		e.DELETE(path).
			WithPath("category_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})

	t.Run("category associated with other posts", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		// selectWithSpace(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, newData.Name, newData.Slug, TestDescriptionJson, TestDescriptionHtml, newData.BackgroundColour, newData.ParentID, newData.MetaFields, newData.MediumID, newData.IsFeatured, 1, newData.Meta, newData.HeaderCode, newData.FooterCode))

		categoryPostAssociation(mock, 1)

		e.DELETE(path).
			WithPath("category_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("updating children categories fail", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		// selectWithSpace(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, newData.Name, newData.Slug, TestDescriptionJson, TestDescriptionHtml, newData.BackgroundColour, newData.ParentID, newData.MetaFields, newData.MediumID, newData.IsFeatured, 1, newData.Meta, newData.HeaderCode, newData.FooterCode))

		categoryPostAssociation(mock, 0)

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(nil, 1, 1).
			WillReturnError(errors.New("cannot update categories"))
		mock.ExpectRollback()

		e.DELETE(path).
			WithPath("category_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("deleting categories fail", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		// selectWithSpace(mock)
		mock.ExpectQuery(selectQuery).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, newData.Name, newData.Slug, TestDescriptionJson, TestDescriptionHtml, newData.BackgroundColour, newData.ParentID, newData.MetaFields, newData.MediumID, newData.IsFeatured, 1, newData.Meta, newData.HeaderCode, newData.FooterCode))

		categoryPostAssociation(mock, 0)

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"categories\"`).
			WithArgs(nil, 1, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectExec(deleteQuery).
			WithArgs(test.AnyTime{}, 1).
			WillReturnError(errors.New("cannot delete categories"))
		mock.ExpectRollback()

		e.DELETE(path).
			WithPath("category_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

}
