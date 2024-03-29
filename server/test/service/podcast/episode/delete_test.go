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

func TestEpisodeDelete(t *testing.T) {
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

	// invalid episode id
	t.Run("invalid episode id", func(t *testing.T) {
		e.DELETE(path).
			WithPath("episode_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	// episode record not found
	t.Run("record not found", func(t *testing.T) {
		e.DELETE(path).
			WithPath("episode_id", "1000").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	// delete episode by id
	t.Run("delete episode by id", func(t *testing.T) {
		e.DELETE(path).
			WithPath("episode_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})

}
