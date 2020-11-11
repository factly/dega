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

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(0))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("nodes").
			Array().
			Empty()
		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of permissions", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(len(permissionList)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, permissionList[0]["organisation_id"], permissionList[0]["spaces"], permissionList[0]["media"], permissionList[0]["posts"], permissionList[0]["fact_check"]).
				AddRow(2, time.Now(), time.Now(), nil, permissionList[1]["organisation_id"], permissionList[1]["spaces"], permissionList[1]["media"], permissionList[1]["posts"], permissionList[1]["fact_check"]))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(permissionList[0])
		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of permissions with pagination", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(len(permissionList)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(2, time.Now(), time.Now(), nil, permissionList[1]["organisation_id"], permissionList[1]["spaces"], permissionList[1]["media"], permissionList[1]["posts"], permissionList[1]["fact_check"]))

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{"page": 2, "limit": 1}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(permissionList[1])
		test.ExpectationsMet(t, mock)
	})
}
