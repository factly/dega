package post

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

var updatePost = map[string]interface{}{
	"title":              "Post",
	"subtitle":           "post subtitle",
	"status":             "published",
	"excerpt":            "post excerpt",
	"description":        test.NilJsonb(),
	"is_featured":        false,
	"is_sticky":          true,
	"is_highlighted":     true,
	"featured_medium_id": uint(1),
	"format_id":          uint(1),
	"published_date":     time.Time{},
	"category_ids":       []uint{1},
	"tag_ids":            []uint{1},
	"claim_ids":          []uint{1},
	"author_ids":         []uint{1},
}

func TestPostUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid claim id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.PUT(path).
			WithPath("post_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("claim record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		recordNotFoundMock(mock)

		e.PUT(path).
			WithPath("post_id", "100").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
	})
	t.Run("Unable to decode claim data", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("Unprocessable claim", func(t *testing.T) {

		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("update claim", func(t *testing.T) {
		updatePost["slug"] = "post"
		test.CheckSpaceMock(mock)

		updateMock(mock, updatePost, false)

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(postData)

		test.ExpectationsMet(t, mock)
	})

	t.Run("update claim by id with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatePost["slug"] = "post"

		updateMock(mock, updatePost, true)

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(dataWithoutSlug).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(postData)

		test.ExpectationsMet(t, mock)

	})

	t.Run("update claim with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		updatePost["slug"] = "post-test"

		updateMock(mock, updatePost, true)

		postData["slug"] = "post-test"

		e.PUT(path).
			WithPath("post_id", 1).
			WithHeaders(headers).
			WithJSON(updatePost).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(postData)

		test.ExpectationsMet(t, mock)

	})

}
