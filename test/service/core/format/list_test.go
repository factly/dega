package format

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/util"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestFormatList(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	formatlist := []map[string]interface{}{
		{"name": "Test Format 1", "slug": "test-format-1"},
		{"name": "Test Format 2", "slug": "test-format-2"},
	}

	s := test.RunDefaultNATSServer()
	defer s.Shutdown()
	util.ConnectNats()

	t.Run("get empty list of formats", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		formatCountQuery(mock, 0)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})

		test.ExpectationsMet(t, mock)
	})

	t.Run("get non-empty list of formats", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		formatCountQuery(mock, len(formatlist))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, formatlist[0]["name"], formatlist[0]["slug"]).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, formatlist[1]["name"], formatlist[1]["slug"]))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(formatlist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(formatlist[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get formats with pagination", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		formatCountQuery(mock, len(formatlist))

		mock.ExpectQuery(paginationQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, formatlist[1]["name"], formatlist[1]["slug"]))

		e.GET(basePath).
			WithQueryObject(map[string]interface{}{
				"limit": "1",
				"page":  "2",
			}).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(formatlist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(formatlist[1])

		test.ExpectationsMet(t, mock)

	})
}
