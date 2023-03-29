package rating

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

func TestRatingCreate(t *testing.T) {

	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM ratings")
	config.DB.Exec("DELETE FROM space_permissions")
	config.DB.Exec("DELETE FROM media")

	var insertData = model.Rating{
		Name:             "Test Rating",
		Slug:             "test-rating",
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

	config.DB.Model(&model.Rating{}).Create(&insertData)
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
	// unprocessable entity
	t.Run("unprocessable entity", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("invalid space header", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(map[string]string{
				"X-User": "1",
			}).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnauthorized)
	})

	t.Run("invalid user id", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(map[string]string{
				"X-Space": "0",
				"X-User":  "0",
			}).
			Expect().
			Status(http.StatusUnauthorized)

	})

	// unable to decode rating
	t.Run("unable to decode rating", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("create rating", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().Object().ContainsMap(resData)
	})

	//create a rating with empty slug
	t.Run("create rating with empty slug", func(t *testing.T) {
		Data["name"] = "Test Rating 2"
		Data["slug"] = ""
		resData["name"] = "Test Rating 2"
		resData["slug"] = "test-rating-2"
		Data["numeric_value"] = 2
		resData["numeric_value"] = 2
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().Object().ContainsMap(resData)
	})

	// medium does not belong to same space
	t.Run("medium does not belong to same space", func(t *testing.T) {
		Data["medium_id"] = 100
		Data["numeric_value"] = 3
		Data["name"] = "Test Rating 3"
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("create rating with same name", func(t *testing.T) {
		Data["medium_id"] = TestMediumID
		Data["name"] = TestName
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("cannot parse rating description", func(t *testing.T) {
		Data["description"] = "invalid json"
		// Data
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

}
