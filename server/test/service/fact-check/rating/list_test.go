package rating

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestRatingList(t *testing.T) {

	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM ratings")
	config.DB.Exec("DELETE FROM space_permissions")
	config.DB.Exec("DELETE FROM media")
	var insertSpacePermissionData = coreModel.SpacePermission{
		SpaceID:   TestSpaceID,
		FactCheck: true,
		Media:     100,
		Posts:     100,
		Podcast:   true,
		Episodes:  100,
		Videos:    100,
	}

	var insertMediumData = coreModel.Medium{
		Name:    "Test Medium",
		Slug:    "test-medium",
		SpaceID: TestSpaceID,
	}

	config.DB.Model(&coreModel.SpacePermission{}).Create(&insertSpacePermissionData)
	config.DB.Model(&coreModel.Medium{}).Create(&insertMediumData)

	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of rating", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().Value("nodes").Array().Empty()
	})

	t.Run("get list of rating", func(t *testing.T) {
		var insertData = model.Rating{
			Name:             TestName,
			Slug:             TestSlug,
			BackgroundColour: TestBackgroundColour,
			TextColour:       TestTextColour,
			Description:      TestDescriptionJson,
			DescriptionHTML:  TestDescriptionHtml,
			NumericValue:     TestNumericValue,
			MediumID:         &TestMediumID,
			SpaceID:          TestSpaceID,
			FooterCode:       TestFooterCode,
			HeaderCode:       TestHeaderCode,
		}
		if err := config.DB.Model(&model.Rating{}).Create(&insertData).Error; err != nil {
			log.Fatal(err)
		}
		insertData.Name = "Test Rating 2"
		insertData.Slug = "test-rating-2"
		insertData.NumericValue = 2
		insertData.ID = 100000
		if err := config.DB.Model(&model.Rating{}).Create(&insertData).Error; err != nil {
			log.Fatal(err)
		}

		resData["name"] = insertData.Name
		resData["slug"] = insertData.Slug
		resData["numeric_value"] = insertData.NumericValue

		e.GET(basePath).
			WithHeaders(headers).
			WithQuery("all", "true").
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(map[string]interface{}{
			"total": 2}).Value("nodes").Array().Element(0).Object().ContainsMap(resData)

	})

	t.Run("get rating with pagination", func(t *testing.T) {
		resData["name"] = TestName
		resData["slug"] = TestSlug
		resData["numeric_value"] = TestNumericValue
		e.GET(basePath).
			WithHeaders(headers).
			WithQuery("page", 2).
			WithQuery("limit", 1).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(map[string]interface{}{
			"total": 2}).Value("nodes").Array().Element(0).Object().ContainsMap(resData)
	})
}
