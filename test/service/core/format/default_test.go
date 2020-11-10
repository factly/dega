package format

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service/core/action/format"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestDefaultFormatCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	format.DataFile = "../../../../data/formats.json"

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("create default formats", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "formats"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, defaultData[0]["name"], defaultData[0]["slug"], defaultData[0]["description"], 1, test.AnyTime{}, test.AnyTime{}, nil, defaultData[1]["name"], defaultData[1]["slug"], defaultData[1]["description"], 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))
		mock.ExpectCommit()

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).JSON().
			Object().
			Value("nodes").
			Array()
		test.ExpectationsMet(t, mock)

	})

	t.Run("when cannot open data file", func(t *testing.T) {
		format.DataFile = "nofile.json"
		test.CheckSpaceMock(mock)

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		format.DataFile = "../../../../data/formats.json"
	})

	t.Run("when cannot parse data file", func(t *testing.T) {
		format.DataFile = "invalidData.json"
		test.CheckSpaceMock(mock)

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		format.DataFile = "../../../../data/formats.json"
	})

	t.Run("when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "formats"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, defaultData[0]["name"], defaultData[0]["slug"], defaultData[0]["description"], 1, test.AnyTime{}, test.AnyTime{}, nil, defaultData[1]["name"], defaultData[1]["slug"], defaultData[1]["description"], 1).
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
