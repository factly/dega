package episode

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

func TestEpisodeList(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	config.DB.Exec("DELETE FROM ratings")
	config.DB.Exec("DELETE FROM space_permissions")
	config.DB.Exec("DELETE FROM authors")
	config.DB.Exec("DELETE FROM episodes")
	config.DB.Exec("DELETE FROM media")
	config.DB.Exec("DELETE FROM categories")
	config.DB.Exec("DELETE FROM podcasts")
	config.DB.Exec("DELETE FROM episode_authors")

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
	// get an empty list of episodes
	t.Run("get an empty list of episodes", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0, "nodes": []interface{}{}})
	})

	// get list of episodes
	t.Run("get list of episodes", func(t *testing.T) {
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
			Title:             "Podcast Test",
			Slug:              "podcast-test",
			PrimaryCategoryID: &insertCategoryData.ID,
			MediumID:          &insertMediumData.ID,
			Description:       TestDescriptionJson,
			DescriptionHTML:   TestDescriptionHtml,
			SpaceID:           uint(TestSpaceID),
		}

		if err := config.DB.Model(&model.Podcast{}).Create(&insertPodcastData).Error; err != nil {
			log.Fatal(err)
		}

		inserAuthorData := coreModel.Author{
			FirstName: "Author",
			LastName:  "Test",
		}

		if err := config.DB.Model(&coreModel.Author{}).Create(&inserAuthorData).Error; err != nil {
			log.Fatal(err)
		}

		insertData := model.Episode{
			Title:           "Episode Test",
			Slug:            "episode-test",
			MediumID:        &insertMediumData.ID,
			Description:     TestDescriptionJson,
			DescriptionHTML: TestDescriptionHtml,
			PodcastID:       &insertPodcastData.ID,
			SpaceID:         uint(TestSpaceID),
			AudioURL:        TestAudioURL,
			Season:          TestSeason,
			Episode:         TestEpisode,
		}

		if err := config.DB.Model(&model.Episode{}).Create(&insertData).Error; err != nil {
			log.Fatal(err)
		}

		insertData.ID = 9999
		insertData.Title = "Episode Test 2"
		insertData.Slug = "episode-test-2"
		resData["title"] = "Episode Test"
		resData["slug"] = "episode-test"

		if err := config.DB.Model(&model.Episode{}).Create(&insertData).Error; err != nil {
			log.Fatal(err)
		}

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 2}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)

	})

	// get list of episodes with pagination
	t.Run("get list of episodes with pagination", func(t *testing.T) {
		resData["title"] = "Episode Test 2"
		resData["slug"] = "episode-test-2"
		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{"page": 2, "limit": 1}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 2}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)
	})
}
