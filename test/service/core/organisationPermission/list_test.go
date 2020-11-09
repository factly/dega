package organisationPermission

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestOrganisationPermissionList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	viper.Set("organisation_id", 1)

	t.Run("get empty list of permissions", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Empty()
		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of permissions", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, permissionList[0]["organisation_id"], permissionList[0]["spaces"], permissionList[0]["media"], permissionList[0]["posts"]).
				AddRow(2, time.Now(), time.Now(), nil, permissionList[1]["organisation_id"], permissionList[1]["spaces"], permissionList[1]["media"], permissionList[1]["posts"]))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Element(0).
			Object().
			ContainsMap(permissionList[0])
		test.ExpectationsMet(t, mock)
	})
}
