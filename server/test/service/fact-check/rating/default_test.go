package rating

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

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

		for i := 0; i < 6; i++ {
			mock.ExpectQuery(selectQuery).
				WillReturnRows(sqlmock.NewRows(columns))

			mock.ExpectQuery(`INSERT INTO "ratings"`).
				WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, defaultData[i]["name"], defaultData[i]["slug"], defaultData[i]["background_colour"], defaultData[i]["text_colour"], defaultData[i]["description"], defaultData[i]["html_description"], defaultData[i]["numeric_value"], nil, 1).
				WillReturnRows(sqlmock.
					NewRows([]string{"id"}).
					AddRow(1))
		}
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

	t.Run("default ratings already created", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		mock.ExpectBegin()

		for i := 0; i < 6; i++ {
			mock.ExpectQuery(selectQuery).
				WillReturnRows(sqlmock.NewRows(columns).
					AddRow(1, time.Now(), time.Now(), nil, 1, 1, defaultData[i]["name"], defaultData[i]["slug"], defaultData[i]["background_colour"], defaultData[i]["text_colour"], defaultData[i]["medium_id"], defaultData[i]["description"], defaultData[i]["html_description"], defaultData[i]["numeric_value"], 1))
		}
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

}
