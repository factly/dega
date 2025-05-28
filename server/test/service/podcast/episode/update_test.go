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

func TestEpisodeUpdate(t *testing.T) {
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
	}

	if err := config.DB.Model(&model.Episode{}).Create(&insertData).Error; err != nil {
		log.Fatal(err)
	}

	insertEpisodeAuthorData := model.EpisodeAuthor{
		EpisodeID: insertData.ID,
		AuthorID:  inserAuthorData.ID,
	}
	if err := config.DB.Model(&model.EpisodeAuthor{}).Create(&insertEpisodeAuthorData).Error; err != nil {
		log.Fatal(err)
	}

	Data["podcast_id"] = insertPodcastData.ID
	Data["medium_id"] = insertMediumData.ID
	Data["author_ids"] = []uint{inserAuthorData.ID}

	e := httpexpect.New(t, testServer.URL)

	// invalid podcast id
	t.Run("invalid podcast id", func(t *testing.T) {
		e.PUT(path).
			WithPath("episode_id", "invalid_id").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
	})

	// podcast record not found
	t.Run("podcast record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("episode_id", 9999).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
	})

	// unable to decode episode
	t.Run("unable to decode episode", func(t *testing.T) {
		e.PUT(path).
			WithPath("episode_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// unable to parse description
	t.Run("unable to parse description", func(t *testing.T) {
		Data["description"] = "invalid description"
		e.PUT(path).
			WithPath("episode_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["description"] = TestDescriptionFromRequest
	})

	// update episode
	t.Run("update episode", func(t *testing.T) {
		Data["title"] = "Updated Episode Test"
		Data["slug"] = "updated-episode-test"
		resData["title"] = "Updated Episode Test"
		resData["slug"] = "updated-episode-test"
		e.PUT(path).
			WithPath("episode_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(200).
			JSON().
			Object().
			ContainsMap(resData)
	})

	// update episode with podcast id = 0
	t.Run("update episode with podcast id = 0", func(t *testing.T) {
		Data["podcast_id"] = 0
		resData["podcast_id"] = nil
		e.PUT(path).
			WithPath("episode_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(200).
			JSON().
			Object().
			ContainsMap(resData)
	})

	// update episode with medium id = 0
	t.Run("update episode with medium id = 0", func(t *testing.T) {
		Data["medium_id"] = 0
		resData["medium_id"] = nil
		e.PUT(path).
			WithPath("episode_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(200).
			JSON().
			Object().
			ContainsMap(resData)
	})

}
