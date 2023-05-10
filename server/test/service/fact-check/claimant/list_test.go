package claimant

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

func TestClaimainList(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM claimants")
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
	var insertData model.Claimant

	config.DB.Model(&coreModel.SpacePermission{}).Create(&insertSpacePermissionData)
	err := config.DB.Model(&coreModel.Medium{}).Create(&insertMediumData).Error
	if err != nil {
		log.Fatal(err)
	}

	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty claimant list", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().Value("nodes").Array().Empty()
	})

	t.Run("get claimant list", func(t *testing.T) {
		insertData = model.Claimant{
			Name:            TestName,
			Slug:            TestSlug,
			SpaceID:         TestSpaceID,
			Description:     TestDescriptionJson,
			DescriptionHTML: TestDescriptionHtml,
			FooterCode:      TestFooterCode,
			HeaderCode:      TestHeaderCode,
			MediumID:        &insertMediumData.ID,
			TagLine:         TestTagline,
		}
		config.DB.Model(&model.Claimant{}).Create(&insertData)
		insertData.ID = 10000
		insertData.Name = "Test Name 2"
		insertData.Slug = "test-name-2"

		config.DB.Model(&model.Claimant{}).Create(&insertData)
		resData["name"] = TestName
		resData["slug"] = TestSlug
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

	// run claimants with pagination
	t.Run("get claimant list with pagination", func(t *testing.T) {
		resData["name"] = "Test Name 2"
		resData["slug"] = "test-name-2"
		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{"page": 2, "limit": 1}).
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
