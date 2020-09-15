package post

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/format"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/tag"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestPostCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable post", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Unable to decode post", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create post", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)

		tag.SelectWithOutSpace(mock, tag.Data)
		category.SelectWithOutSpace(mock)

		postInsertMock(mock, Data)
		postSelectWithOutSpace(mock, Data)
		postClaimInsertMock(mock)
		postClaimSelectMock(mock)
		postAuthorInsertMock(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(postData)

		test.ExpectationsMet(t, mock)

	})

	t.Run("creating post claims fail", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)

		tag.SelectWithOutSpace(mock, tag.Data)
		category.SelectWithOutSpace(mock)

		postInsertMock(mock, Data)
		postSelectWithOutSpace(mock, Data)
		mock.ExpectQuery(`INSERT INTO "post_claims"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1).
			WillReturnError(errors.New("cannot create post_claims"))

		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)

	})

	t.Run("create post with slug is empty", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)

		tag.SelectWithOutSpace(mock, tag.Data)
		category.SelectWithOutSpace(mock)

		postInsertMock(mock, Data)

		postSelectWithOutSpace(mock, Data)
		postClaimInsertMock(mock)
		postClaimSelectMock(mock)
		postAuthorInsertMock(mock)
		mock.ExpectCommit()

		Data["slug"] = ""
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object().ContainsMap(postData)
		Data["slug"] = "post"
		test.ExpectationsMet(t, mock)
	})

	t.Run("medium does not belong same space", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)

		tag.SelectWithOutSpace(mock, tag.Data)
		category.SelectWithOutSpace(mock)
		mock.ExpectBegin()
		medium.EmptyRowMock(mock)
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})
	t.Run("format does not belong same space", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)

		tag.SelectWithOutSpace(mock, tag.Data)
		category.SelectWithOutSpace(mock)
		mock.ExpectBegin()
		medium.SelectWithSpace(mock)
		format.EmptyRowMock(mock)
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("create post when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		slugCheckMock(mock, Data)

		tag.SelectWithOutSpace(mock, tag.Data)
		category.SelectWithOutSpace(mock)

		postInsertMock(mock, Data)
		postSelectWithOutSpace(mock, Data)
		postClaimInsertMock(mock)
		postClaimSelectMock(mock)
		postAuthorInsertMock(mock)
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

}
