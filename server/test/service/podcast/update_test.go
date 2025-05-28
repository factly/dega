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

func TestPodcastUpdate(t *testing.T) {
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
		e.PUT(path).
			WithPath("podcast_id", "invalid_id").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
	})

	// podcast record not found
	t.Run("podcast record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("podcast_id", "1000").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
	})

	// invalid podcast body
	t.Run("invalid podcast body", func(t *testing.T) {
		e.PUT(path).
			WithPath("podcast_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// undecodable podcast body
	t.Run("undecodable podcast body", func(t *testing.T) {
		e.PUT(path).
			WithPath("podcast_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// cannot parse podcase description
	t.Run("cannot parse podcase description", func(t *testing.T) {
		Data["description"] = "invalid_description"
		e.PUT(path).
			WithPath("podcast_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["description"] = TestDescriptionFromRequest
	})

	// update category_id fails
	t.Run("update category_id fails", func(t *testing.T) {
		Data["primary_category_id"] = 1000
		e.PUT(path).
			WithPath("podcast_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
		Data["primary_category_id"] = insertCategoryData.ID
	})

	// update medium_id fails
	t.Run("update medium_id fails", func(t *testing.T) {
		Data["medium_id"] = 1000
		e.PUT(path).
			WithPath("podcast_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
		Data["medium_id"] = insertMediumData.ID
	})

	// update podcast with medium_id=0
	t.Run("update podcast with medium_id=0", func(t *testing.T) {
		Data["medium_id"] = 0
		e.PUT(path).
			WithPath("podcast_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK)
		Data["medium_id"] = insertMediumData.ID
	})

}
