package medium

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestMediumList(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM media")
	config.DB.Exec("DELETE FROM space_permissions")

	var insertData model.Medium

	e := httpexpect.New(t, testServer.URL)
	t.Run("get empty list of media", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})
	})

	t.Run("get non-empty list of media", func(t *testing.T) {
		insertData = model.Medium{
			Name:        "Create Medium Test 1",
			Slug:        "create-medium-test-1",
			Description: TestDescription,
			Type:        TestType,
			Title:       TestTitle,
			Caption:     TestCaption,
			AltText:     TestAltText,
			FileSize:    TestFileSize,
			URL:         TestUrl,
			Dimensions:  TestDimensions,
			MetaFields:  TestMetaFields,
			SpaceID:     TestSpaceID,
		}
		config.DB.Create(&insertData)
		insertData = model.Medium{
			Name:        "Create Medium Test 2",
			Slug:        "create-medium-test-2",
			Description: TestDescription,
			Type:        TestType,
			Title:       TestTitle,
			Caption:     TestCaption,
			AltText:     TestAltText,
			FileSize:    TestFileSize,
			URL:         TestUrl,
			Dimensions:  TestDimensions,
			MetaFields:  TestMetaFields,
			SpaceID:     TestSpaceID,
		}
		config.DB.Create(&insertData)

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 2})

	})
	// should run test after running 'get non-empty list of media'
	t.Run("get media with pagination", func(t *testing.T) {

		res := e.GET(basePath).
			WithQueryObject(map[string]string{
				"limit": "1",
				"page":  "2",
				"sort":  "asc",
			}).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 2}).
			Value("nodes").
			Array().
			Element(0).
			Object()

		Data["name"] = "Create Medium Test 2"
		Data["slug"] = "create-medium-test-2"

		res.ContainsMap(Data)

	})
	t.Run("get list of posts based on query", func(t *testing.T) {
		// meiliObj := map[string]interface{}{
		// 	"id":       insertData.ID,
		// 	"name":     insertData.Name,
		// 	"slug":     insertData.Slug,
		// 	"kind":     "medium",
		// 	"type":     insertData.Type,
		// 	"space_id": insertData.SpaceID,
		// }
		// if err := meilisearchx.AddDocument(viper.GetString("MEILISEARCH_INDEX"), meiliObj); err != nil {
		// 	log.Fatal(err)
		// }
		// e.GET(basePath).
		// 	WithQuery("q", "te").
		// 	WithHeaders(headers).
		// 	Expect().
		// 	Status(http.StatusOK).
		// 	JSON().
		// 	Object().
		// 	ContainsMap(map[string]interface{}{"total": 1}).
		// 	Value("nodes").
		// 	Array().
		// 	Element(0).
		// 	Object().
		// 	ContainsMap(map[string]interface{}{
		// 		"space_id": insertData.SpaceID,
		// 		"name":     insertData.Name,
		// 		"slug":     insertData.Slug,
		// 		"type":     insertData.Type,
		// 	})
		// log.Fatal(viper.GetString("MEILISEARCH_INDEX"))
		// if err := meilisearchx.DeleteDocument("dega-test", insertData.ID, "medium"); err != nil {
		// 	log.Fatal(err)
		// }
	})
}
