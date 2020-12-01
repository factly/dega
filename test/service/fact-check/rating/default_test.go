package rating

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service/fact-check/action/rating"
	"github.com/factly/dega-server/test/service/core/spacePermission"

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

	rating.DataFile = "../../../../data/ratings.json"

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("create default ratings", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		mock.ExpectBegin()

		mock.ExpectQuery(`INSERT INTO "ratings"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[0]["name"], defaultData[0]["slug"], nil, defaultData[0]["numeric_value"], nil, 1, test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[1]["name"], defaultData[1]["slug"], nil, defaultData[1]["numeric_value"], nil, 1, test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[2]["name"], defaultData[2]["slug"], nil, defaultData[2]["numeric_value"], nil, 1, test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[3]["name"], defaultData[3]["slug"], nil, defaultData[3]["numeric_value"], nil, 1, test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[4]["name"], defaultData[4]["slug"], nil, defaultData[4]["numeric_value"], nil, 1).
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
		spacePermission.SelectQuery(mock, 1)

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
		spacePermission.SelectQuery(mock, 1)

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		rating.DataFile = "../../../../data/ratings.json"
	})

	t.Run("when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)

		mock.ExpectBegin()

		mock.ExpectQuery(`INSERT INTO "ratings"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[0]["name"], defaultData[0]["slug"], nil, defaultData[0]["numeric_value"], nil, 1, test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[1]["name"], defaultData[1]["slug"], nil, defaultData[1]["numeric_value"], nil, 1, test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[2]["name"], defaultData[2]["slug"], nil, defaultData[2]["numeric_value"], nil, 1, test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[3]["name"], defaultData[3]["slug"], nil, defaultData[3]["numeric_value"], nil, 1, test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[4]["name"], defaultData[4]["slug"], nil, defaultData[4]["numeric_value"], nil, 1).
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
