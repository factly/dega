package claimant

import (
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

func TestClaimantCreate(t *testing.T) {

	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data

	config.DB.Exec("DELETE FROM ratings")
	config.DB.Exec("DELETE FROM space_permissions")
	config.DB.Exec("DELETE FROM media")

	var insertData = model.Claimant{
		Name:            "Test Claimant",
		Slug:            "test-claimant",
		Description:     TestDescriptionJson,
		DescriptionHTML: TestDescriptionHtml,
		MediumID:        &TestMediumID,
		SpaceID:         TestSpaceID,
		FooterCode:      TestFooterCode,
		HeaderCode:      TestHeaderCode,
	}

	config.DB.Model(&model.Claimant{}).Create(&insertData)

	var insertMediumData = coreModel.Medium{
		Name:    "Test Medium",
		Slug:    "test-medium",
		SpaceID: TestSpaceID,
	}

	config.DB.Model(&coreModel.Medium{}).Create(&insertMediumData)

	e := httpexpect.New(t, testServer.URL)

	t.Run("unprocessable claimant", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("Unable to decode claimant", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("create claimant", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(resData)
	})

	t.Run("create claimant when claimant already exist", func(t *testing.T) {
		Data["name"] = insertData.Name
		Data["slug"] = insertData.Slug
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// cannot parse claimant description
	t.Run("cannot parse claimant description", func(t *testing.T) {
		Data["description"] = "invalid description"
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// create claimant with empty slug
	t.Run("create claimant with empty slug", func(t *testing.T) {
		Data["slug"] = ""
		Data["name"] = "Test Claimant 2"
		Data["description"] = TestDescriptionFromRequest
		resData["name"] = "Test Claimant 2"
		resData["slug"] = "test-claimant-2"

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			JSON().
			Object().
			ContainsMap(resData)
	})

	// medium does not belong to same space
	t.Run("medium does not belong to same space", func(t *testing.T) {
		Data["medium_id"] = 100
		Data["name"] = "Test Claimant 3"
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
	})
}
