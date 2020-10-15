package medium

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestMediumCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable medium", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode medium", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	Data["url"] = test.NilJsonb()
	viper.Reset()
	viper.Set("kavach.url", "http://kavach:6620")
	viper.Set("keto.url", "http://keto:6644")
	viper.Set("meili.url", "http://meili:7700")
	viper.Set("meili.key", "password")

	t.Run("create medium", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		slugCheckMock(mock, Data)

		mediumInsertMock(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(Data)
		test.ExpectationsMet(t, mock)

	})
	t.Run("create medium with empty slug", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		slugCheckMock(mock, Data)

		mediumInsertMock(mock)
		mock.ExpectCommit()

		Data["slug"] = ""
		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object()
		Data["slug"] = "image"
		res.ContainsMap(Data)
		test.ExpectationsMet(t, mock)
	})

	t.Run("medium does not belong same space", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		slugCheckMock(mock, Data)
		mediumInsertError(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	viper.Set("imageproxy.url", "http://testing.com")

	t.Run("invalid url in body", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		slugCheckMock(mock, Data)

		mediumInsertMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	viper.Reset()

	t.Run("create medium when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)
		slugCheckMock(mock, Data)

		mediumInsertMock(mock)
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	Data["url"] = postgres.Jsonb{
		RawMessage: []byte(`{"raw": "http://testimage.com/test.jpg"}`),
	}
}
