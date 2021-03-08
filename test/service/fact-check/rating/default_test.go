package rating

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service/fact-check/action/rating"
	"github.com/factly/dega-server/test/service/core/permissions/space"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestDefaultRatingCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	rating.DataFile = "./testDefault.json"

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("create default ratings", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		mock.ExpectBegin()

		mock.ExpectQuery(`INSERT INTO "ratings"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[0]["name"], defaultData[0]["slug"], defaultData[0]["colour"], defaultData[0]["description"], defaultData[0]["numeric_value"], nil, 1,

				test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[1]["name"], defaultData[1]["slug"], defaultData[1]["colour"], defaultData[1]["description"], defaultData[1]["numeric_value"], nil, 1,

				test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[2]["name"], defaultData[2]["slug"], defaultData[2]["colour"], defaultData[2]["description"], defaultData[2]["numeric_value"], nil, 1,

				test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[3]["name"], defaultData[3]["slug"], defaultData[3]["colour"], defaultData[3]["description"], defaultData[3]["numeric_value"], nil, 1,

				test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[4]["name"], defaultData[4]["slug"], defaultData[4]["colour"], defaultData[4]["description"], defaultData[4]["numeric_value"], nil, 1,

				test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[5]["name"], defaultData[5]["slug"], defaultData[5]["colour"], defaultData[5]["description"], defaultData[5]["numeric_value"], nil, 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectCommit()

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			Value("nodes").
			Array()
		test.ExpectationsMet(t, mock)
	})

	t.Run("when cannot open data file", func(t *testing.T) {
		rating.DataFile = "nofile.json"
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		rating.DataFile = "../../../../data/ratings.json"

	})

	t.Run("when cannot parse data file", func(t *testing.T) {
		rating.DataFile = "invalidData.json"
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		rating.DataFile = "./testDefault.json"
	})

	t.Run("when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		mock.ExpectBegin()

		mock.ExpectQuery(`INSERT INTO "ratings"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[0]["name"], defaultData[0]["slug"], defaultData[0]["colour"], defaultData[0]["description"], defaultData[0]["numeric_value"], nil, 1,

				test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[1]["name"], defaultData[1]["slug"], defaultData[1]["colour"], defaultData[1]["description"], defaultData[1]["numeric_value"], nil, 1,

				test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[2]["name"], defaultData[2]["slug"], defaultData[2]["colour"], defaultData[2]["description"], defaultData[2]["numeric_value"], nil, 1,

				test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[3]["name"], defaultData[3]["slug"], defaultData[3]["colour"], defaultData[3]["description"], defaultData[3]["numeric_value"], nil, 1,

				test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[4]["name"], defaultData[4]["slug"], defaultData[4]["colour"], defaultData[4]["description"], defaultData[4]["numeric_value"], nil, 1,

				test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[5]["name"], defaultData[5]["slug"], defaultData[5]["colour"], defaultData[5]["description"], defaultData[5]["numeric_value"], nil, 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectRollback()

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
