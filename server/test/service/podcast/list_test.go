package podcast

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestPodcastList(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	config.DB.Exec("DELETE FROM ratings")
	config.DB.Exec("DELETE FROM space_permissions")
	config.DB.Exec("DELETE FROM media")
	config.DB.Exec("DELETE FROM categories")
	config.DB.Exec("DELETE FROM podcasts")

	var insertSpacePermissionData = coreModel.SpacePermission{
		SpaceID:   TestSpaceID,
		FactCheck: true,
		Media:     100,
		Posts:     100,
		Podcast:   true,
		Episodes:  100,
		Videos:    100,
	}
	config.DB.Model(&coreModel.SpacePermission{}).Create(&insertSpacePermissionData)

	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of podcasts", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("nodes").
			Array().
			Empty()
	})

	t.Run("get list of podcasts", func(t *testing.T) {
		insertCategoryData := coreModel.Category{
			Name:    "Category",
			Slug:    "category",
			SpaceID: TestSpaceID,
		}
		insertMediumData := coreModel.Medium{
			Name:    "Medium",
			Slug:    "medium",
			SpaceID: TestSpaceID,
		}
		config.DB.Model(&coreModel.Category{}).Create(&insertCategoryData)
		config.DB.Model(&coreModel.Medium{}).Create(&insertMediumData)

		insertPodcastData := model.Podcast{
			SpaceID:           TestSpaceID,
			Title:             "Podcast Test",
			Slug:              "podcast-test",
			PrimaryCategoryID: &insertCategoryData.ID,
			MediumID:          &insertMediumData.ID,
			Language:          TestLanguage,
			Description:       TestDescriptionJson,
			DescriptionHTML:   TestDescriptionHtml,
		}

		if err := config.DB.Model(&model.Podcast{}).Create(&insertPodcastData).Error; err != nil {
			log.Fatal(err)
		}
		insertPodcastData.ID = 100000
		insertPodcastData.Title = "Podcast Test 2"
		insertPodcastData.Slug = "podcast-test-2"
		if err := config.DB.Model(&model.Podcast{}).Create(&insertPodcastData).Error; err != nil {
			log.Fatal(err)
		}
		resData["title"] = "Podcast Test"
		resData["slug"] = "podcast-test"
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
			ContainsMap(resData)
	})

	// get list of podcasts with pagination
	t.Run("get list of podcasts with pagination", func(t *testing.T) {
		resData["title"] = "Podcast Test 2"
		resData["slug"] = "podcast-test-2"
		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"page":  2,
				"limit": 1,
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)
	})

}
