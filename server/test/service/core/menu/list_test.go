package menu

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestMenuList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of menus", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "menus"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})

		test.ExpectationsMet(t, mock)
	})

	t.Run("get non-empty list of menus", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "menus"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(len(menulist)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, menulist[0]["name"], menulist[0]["slug"], menulist[0]["menu"], 1).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, menulist[1]["name"], menulist[1]["slug"], menulist[1]["menu"], 1))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(menulist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(menulist[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get non-empty list of menu with paiganation", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "menus"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(len(menulist)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, menulist[1]["name"], menulist[1]["slug"], menulist[1]["menu"], 1))

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"page":  2,
				"limit": 1,
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(menulist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(menulist[1])

		test.ExpectationsMet(t, mock)
	})
}
