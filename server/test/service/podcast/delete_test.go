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
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestPodcastDelete(t *testing.T) {
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

	insertData := model.Podcast{
		Title:             "Podcast Test",
		Slug:              "podcast-test",
		PrimaryCategoryID: &insertCategoryData.ID,
		MediumID:          &insertMediumData.ID,
		Language:          TestLanguage,
		Description:       TestDescriptionJson,
		DescriptionHTML:   TestDescriptionHtml,
		HeaderCode:        TestHeaderCode,
		FooterCode:        TestFooterCode,
		SpaceID:           TestSpaceID,
	}

	if err := config.DB.Model(&model.Podcast{}).Create(&insertData).Error; err != nil {
		log.Fatal(err)
	}
	Data["primary_category_id"] = insertCategoryData.ID
	Data["medium_id"] = insertMediumData.ID
	e := httpexpect.New(t, testServer.URL)
	// invalid podcast id
	t.Run("invalid podcast id", func(t *testing.T) {

		e.DELETE(path).
			WithPath("podcast_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	// podcast record not found
	t.Run("podcast record not found", func(t *testing.T) {
		e.DELETE(path).
			WithPath("podcast_id", 9999).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	// delete podcast
	t.Run("delete podcast", func(t *testing.T) {
		e.DELETE(path).
			WithPath("podcast_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})
}
