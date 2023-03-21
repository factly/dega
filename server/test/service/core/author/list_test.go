package author

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"

	"gopkg.in/h2non/gock.v1"
)

func TestAuthorList(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db
	config.DB.Exec("DELETE FROM authors")
	config.DB.Exec("DELETE FROM post_authors")
	config.DB.Exec("DELETE FROM posts")
	e := httpexpect.New(t, testServer.URL)
	t.Run("test list.go", func(t *testing.T) {

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("nodes").
			Array().
			Element(0).
			Object().
			Value("email").
			Equal(test.Dummy_AuthorList[0]["email"])
	})

	t.Run("Missing user for list", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(missingUser).
			Expect().
			Status(http.StatusUnauthorized)
	})

}
