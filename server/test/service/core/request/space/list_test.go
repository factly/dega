package space

import (
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

func TestSpaceRequestList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of requests", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
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

	t.Run("get list of requests", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(len(requestList)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, requestList[0]["title"], requestList[0]["description"], requestList[0]["status"], requestList[0]["media"], requestList[0]["posts"], requestList[0]["episodes"], requestList[0]["podcast"], requestList[0]["fact_check"], requestList[0]["space_id"]).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, requestList[1]["title"], requestList[1]["description"], requestList[1]["status"], requestList[1]["media"], requestList[1]["posts"], requestList[1]["episodes"], requestList[1]["podcast"], requestList[1]["fact_check"], requestList[1]["space_id"]))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(requestList)}).
			Value("nodes").
			Array().Element(0).Object().ContainsMap(requestList[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of approved requests", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(len(requestList)))

		mock.ExpectQuery(selectQuery).
			WithArgs("approved").
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, requestList[0]["title"], requestList[0]["description"], requestList[0]["status"], requestList[0]["media"], requestList[0]["posts"], requestList[0]["episodes"], requestList[0]["podcast"], requestList[0]["fact_check"], requestList[0]["space_id"]).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, requestList[1]["title"], requestList[1]["description"], requestList[1]["status"], requestList[1]["media"], requestList[1]["posts"], requestList[1]["episodes"], requestList[1]["podcast"], requestList[1]["fact_check"], requestList[1]["space_id"]))

		e.GET(basePath).
			WithHeaders(headers).
			WithQuery("status", "approved").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(requestList)}).
			Value("nodes").
			Array().Element(0).Object().ContainsMap(requestList[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of requests with paiganation", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(len(requestList)))

		mock.ExpectQuery(selectQuery).
			WithArgs("pending").
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, requestList[1]["title"], requestList[1]["description"], requestList[1]["status"], requestList[1]["media"], requestList[1]["posts"], requestList[1]["episodes"], requestList[1]["podcast"], requestList[1]["fact_check"], requestList[1]["space_id"]))

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
			ContainsMap(map[string]interface{}{"total": len(requestList)}).
			Value("nodes").
			Array().Element(0).Object().ContainsMap(requestList[1])

		test.ExpectationsMet(t, mock)

	})
}
