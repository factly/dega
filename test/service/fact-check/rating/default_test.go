package rating

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service/fact-check/action/rating"

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

		mock.ExpectBegin()

		for _, rat := range defaultData {
			mock.ExpectQuery(`INSERT INTO "ratings"`).
				WithArgs(test.AnyTime{}, test.AnyTime{}, nil, rat["name"], rat["slug"], rat["description"], rat["numeric_value"], 1).
				WillReturnRows(sqlmock.
					NewRows([]string{"id"}).
					AddRow(1))

			mock.ExpectQuery(regexp.QuoteMeta(`SELECT "medium_id" FROM "ratings"`)).
				WithArgs(sqlmock.AnyArg()).
				WillReturnRows(sqlmock.NewRows([]string{"medium_id"}).AddRow(nil))
		}

		mock.ExpectCommit()

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).JSON().Array()
		test.ExpectationsMet(t, mock)
	})

	t.Run("when cannot open data file", func(t *testing.T) {
		rating.DataFile = "nofile.json"
		test.CheckSpaceMock(mock)

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

		mock.ExpectBegin()

		mock.ExpectQuery(`INSERT INTO "ratings"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, defaultData[0]["name"], defaultData[0]["slug"], defaultData[0]["description"], defaultData[0]["numeric_value"], 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT "medium_id" FROM "ratings"`)).
			WithArgs(sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"medium_id"}).AddRow(nil))

		mock.ExpectRollback()

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
