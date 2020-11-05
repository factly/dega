package space

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestSpaceUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("update a space", func(t *testing.T) {
		updateMock(mock)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid space id", func(t *testing.T) {
		e.PUT(path).
			WithPath("space_id", "invalid").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("unprocessable space body", func(t *testing.T) {
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("undecodable space body", func(t *testing.T) {
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("space record does not exist", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("logo does not exist", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "site_title", "tag_line", "description", "site_address", 1, 1, 1, 1, nilJsonb(), nilJsonb(), nilJsonb(), 1))

		mock.ExpectBegin()
		mediumNotFound(mock)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("logo mobile does not exist", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "site_title", "tag_line", "description", "site_address", 1, 1, 1, 1, nilJsonb(), nilJsonb(), nilJsonb(), 1))

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		mediumNotFound(mock)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("fav icon does not exist", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "site_title", "tag_line", "description", "site_address", 1, 1, 1, 1, nilJsonb(), nilJsonb(), nilJsonb(), 1))

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		medium.SelectWithSpace(mock)
		mediumNotFound(mock)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("mobile icon does not exist", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "site_title", "tag_line", "description", "site_address", 1, 1, 1, 1, nilJsonb(), nilJsonb(), nilJsonb(), 1))

		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		medium.SelectWithSpace(mock)
		medium.SelectWithSpace(mock)
		mediumNotFound(mock)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("update space when logo_id = 0", func(t *testing.T) {
		oneMediaIDZeroMock(mock, test.AnyTime{}, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["logo_mobile_id"], Data["fav_icon_id"], Data["mobile_icon_id"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], 1)

		Data["logo_id"] = 0
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusOK)
		Data["logo_id"] = 1

		test.ExpectationsMet(t, mock)
	})

	t.Run("update space when logo_mobile_id = 0", func(t *testing.T) {
		oneMediaIDZeroMock(mock, test.AnyTime{}, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["logo_id"], Data["fav_icon_id"], Data["mobile_icon_id"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], 1)

		Data["logo_mobile_id"] = 0
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusOK)
		Data["logo_mobile_id"] = 1

		test.ExpectationsMet(t, mock)
	})

	t.Run("update space when fav_icon_id = 0", func(t *testing.T) {
		oneMediaIDZeroMock(mock, test.AnyTime{}, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["logo_id"], Data["logo_mobile_id"], Data["mobile_icon_id"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], 1)

		Data["fav_icon_id"] = 0
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusOK)
		Data["fav_icon_id"] = 1

		test.ExpectationsMet(t, mock)
	})

	t.Run("update space when mobile_icon_id = 0", func(t *testing.T) {
		oneMediaIDZeroMock(mock, test.AnyTime{}, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["logo_id"], Data["logo_mobile_id"], Data["fav_icon_id"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], 1)

		Data["mobile_icon_id"] = 0
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusOK)
		Data["mobile_icon_id"] = 1

		test.ExpectationsMet(t, mock)
	})

	t.Run("update a space when keto is down", func(t *testing.T) {
		test.DisableKetoGock(testServer.URL)

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusUnauthorized)

		test.ExpectationsMet(t, mock)
	})

	t.Run("update a space when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		updateMock(mock)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})
}
