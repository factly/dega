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

func TestClaimantDetails(t *testing.T) {
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
	var insertData = model.Claimant{
		Name:            "Test Claimant",
		Slug:            "test-claimant",
		Description:     TestDescriptionJson,
		DescriptionHTML: TestDescriptionHtml,
		MediumID:        &insertMediumData.ID,
		TagLine:         TestTagline,
		Medium:          &insertMediumData,
		SpaceID:         TestSpaceID,
		FooterCode:      TestFooterCode,
		HeaderCode:      TestHeaderCode,
	}

	if err := config.DB.Model(&model.Claimant{}).Create(&insertData).Error; err != nil {
		log.Fatal(err)
	}

	e := httpexpect.New(t, testServer.URL)

	// invalid claimant id
	t.Run("invalid claimant id", func(t *testing.T) {
		e.GET(path).
			WithPath("claimant_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	// claimant record not found
	t.Run("claimant record not found", func(t *testing.T) {
		e.GET(path).
			WithPath("claimant_id", "100").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	// get claimant by id
	t.Run("get claimant by id", func(t *testing.T) {
		e.GET(path).
			WithPath("claimant_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(map[string]interface{}{
			"name":             "Test Claimant",
			"slug":             "test-claimant",
			"description":      TestDescriptionJson,
			"description_html": TestDescriptionHtml,
			"tag_line":         TestTagline,
			"medium_id":        insertMediumData.ID,
			"space_id":         TestSpaceID,
			"footer_code":      TestFooterCode,
			"header_code":      TestHeaderCode,
		})
	})

}
