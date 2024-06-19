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

func TestPodcastCreate(t *testing.T) {
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
	// unprocesable podcast
	t.Run("unprocesable podcast", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// undecoable podcast
	t.Run("undecodable podcast", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// create podcast
	t.Run("create podcast", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(resData)
	})

	// podcast with same name exists
	t.Run("cannot parse description", func(t *testing.T) {
		Data["description"] = "invalid description"
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["description"] = TestDescriptionFromRequest
	})

}
