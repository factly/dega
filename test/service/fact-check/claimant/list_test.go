package claimant

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestClaimantList(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	claimantlist := []map[string]interface{}{
		{"name": "Test Claimant 1", "slug": "test-claimant-1"},
		{"name": "Test Claimant 2", "slug": "test-claimant-2"},
	}

	t.Run("get empty list of claimants", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		claimantCountQuery(mock, 0)

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

	t.Run("get non-empty list of claimants", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		claimantCountQuery(mock, len(claimantlist))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, claimantlist[0]["name"], claimantlist[0]["slug"], claimantlist[0]["medium_id"], claimantlist[0]["description"], claimantlist[0]["numeric_value"], 1).
				AddRow(2, time.Now(), time.Now(), nil, claimantlist[1]["name"], claimantlist[1]["slug"], claimantlist[1]["medium_id"], claimantlist[1]["description"], claimantlist[1]["numeric_value"], 1))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(claimantlist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(claimantlist[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get claimants with pagination", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		claimantCountQuery(mock, len(claimantlist))

		mock.ExpectQuery(paginationQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(2, time.Now(), time.Now(), nil, claimantlist[1]["name"], claimantlist[1]["slug"], claimantlist[1]["medium_id"], claimantlist[1]["description"], claimantlist[1]["numeric_value"], 1))

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
			ContainsMap(map[string]interface{}{"total": len(claimantlist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(claimantlist[1])

		test.ExpectationsMet(t, mock)

	})
}
