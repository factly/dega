package format

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestFormatCreate(t *testing.T) {

	mock := test.SetupMockDB()

	testServer := httptest.NewServer(Routes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable format", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode format", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create format", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock)

		formatInsertMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(data).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(data)
		test.ExpectationsMet(t, mock)

	})

	t.Run("create format with slug is empty", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock)

		formatInsertMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(dataWithoutSlug).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(data)

		test.ExpectationsMet(t, mock)
	})

}
