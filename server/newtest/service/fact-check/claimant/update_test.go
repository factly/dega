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

func TestClaimantUpdate(t *testing.T) {
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
		e.PUT(path).
			WithPath("claimant_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	// claimant record not found
	t.Run("claimant record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("claimant_id", 1000000000).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	// unable to decode claimant data
	t.Run("unable to decode claimant data", func(t *testing.T) {
		e.PUT(path).
			WithPath("claimant_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// unproucessable claimant
	t.Run("unproucessable claimant", func(t *testing.T) {
		e.PUT(path).
			WithPath("claimant_id", "1").
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// update claimant
	t.Run("update claimant", func(t *testing.T) {
		Data["name"] = "Test Claimant Updated"
		Data["slug"] = "test-claimant-updated"
		resData["name"] = "Test Claimant Updated"
		resData["slug"] = "test-claimant-updated"
		e.PUT(path).
			WithPath("claimant_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().Object().ContainsMap(resData)
	})

	// claimant with same name exists
	t.Run("claimant with same name exists", func(t *testing.T) {
		id := insertData.ID
		insertData.ID = 10000000
		insertData.Name = "Test Claimant Updated New"
		insertData.Slug = "test-claimant-updated-new"
		if err := config.DB.Model(&model.Claimant{}).Create(&insertData).Error; err != nil {
			log.Fatal(err)
		}
		Data["name"] = insertData.Name
		Data["slug"] = insertData.Slug
		e.PUT(path).
			WithPath("claimant_id", id).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// cannot parse claimant description
	t.Run("cannot parse claimant description", func(t *testing.T) {
		Data["description"] = "Test Description"
		e.PUT(path).
			WithPath("claimant_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
}
