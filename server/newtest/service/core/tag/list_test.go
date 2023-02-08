package tag

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestTagList(t *testing.T) {

	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db
	config.DB.Exec("DELETE FROM tags")

	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of tags", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})
	})

	t.Run("get non-empty list of tags", func(t *testing.T) {

		if err := config.DB.CreateInBatches(tag_list, 2).Error; err != nil {
			log.Fatal(err)
		}

		resData["name"] = "List Test 1"
		resData["slug"] = "list-test-1"

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(tag_list)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)
		resData["name"] = TestName
		resData["slug"] = TestSlug
	})
	// should be ran after the `get list of tages est`

	t.Run("get tags with pagination", func(t *testing.T) {
		resData["name"] = "List Test 2"
		resData["slug"] = "list-test-2"
		e.GET(basePath).
			WithQueryObject(map[string]interface{}{
				"limit": "1",
				"page":  "2",
			}).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(tag_list)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)
		resData["name"] = TestName
		resData["slug"] = TestSlug
	})
}
