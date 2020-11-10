package organisationPermission

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestOrganisationPermissionDetails(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	viper.Set("organisation_id", 1)

	t.Run("invalid permission id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.GET(path).
			WithPath("permission_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("permission record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns))

		e.GET(path).
			WithPath("permission_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("get permission by id", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1)

		e.GET(path).
			WithPath("permission_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(Data)
		test.ExpectationsMet(t, mock)
	})

	t.Run("getting permission of other organisation by id", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "spaces"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"organisation_id", "slug", "space_id"}).AddRow(2, "test-space", "1"))

		e.GET(path).
			WithPath("permission_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnauthorized)
		test.ExpectationsMet(t, mock)
	})
}
