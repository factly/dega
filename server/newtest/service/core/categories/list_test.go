package categories

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCategoryList(t *testing.T) {

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all the entries from db
	config.DB.Exec("DELETE FROM categories")

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)
	t.Run("get empty list of categories", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})
	})
	t.Run("get list of categories", func(t *testing.T) {
		config.DB.CreateInBatches(categoryList, 2)

		resData["name"] = "List Test Name 1"
		resData["slug"] = "list-test-name1"
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(categoryList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)

		resData["name"] = TestName
		resData["slug"] = TestSlug
	})
	// should be ran after the `get list of categories test`
	t.Run("get list of categories with pagination", func(t *testing.T) {
		resData["name"] = categoryList[1].Name
		resData["slug"] = categoryList[1].Slug
		e.GET(basePath).
			WithQueryObject(map[string]interface{}{
				"limit": 1,
				"page":  2,
			}).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(categoryList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)
		resData["name"] = TestName
		resData["slug"] = TestSlug
	})
	//TODO: fix meili_search host issue
	// t.Run("get list of categories based on search query q", func(t *testing.T) {
	// 	viper.Set("enable_search_indexing", false)
	// 	resData["name"] = categoryList[0].Name
	// 	resData["slug"] = categoryList[0].Slug
	// 	e.GET(basePath).
	// 		WithHeaders(headers).
	// 		WithQueryObject(map[string]interface{}{
	// 			"q":    "test",
	// 			"sort": "asc",
	// 		}).
	// 		Expect().
	// 		Status(http.StatusOK).
	// 		JSON().
	// 		Object().
	// 		ContainsMap(map[string]interface{}{"total": len(categoryList)}).
	// 		Value("nodes").
	// 		Array().
	// 		Element(0).
	// 		Object().
	// 		ContainsMap(resData)
	// 	resData["slug"] = TestSlug
	// 	resData["name"] = TestName
	// })
}
