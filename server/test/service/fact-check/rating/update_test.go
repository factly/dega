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

func TestRatingUpdate(t *testing.T) {

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
		Name:             "TestName",
		Slug:             "test-name",
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
	if err := config.DB.Model(&model.Rating{}).Create(&insertData).Error; err != nil {
		log.Fatal(err)
	}
	e := httpexpect.New(t, testServer.URL)

	// invalid rating id
	t.Run("invalid rating id", func(t *testing.T) {
		e.PUT(path).
			WithPath("rating_id", "invalid_id").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
	})

	//record not found
	t.Run("record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("rating_id", 10000000).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
	})

	// unable to decode rating data
	t.Run("unable to decode rating data", func(t *testing.T) {
		e.PUT(path).
			WithPath("rating_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// unprocessable rating
	t.Run("unprocessable rating", func(t *testing.T) {
		e.PUT(path).
			WithPath("rating_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// update rating
	t.Run("update rating", func(t *testing.T) {
		resData["name"] = "New Test Rating 100"
		resData["slug"] = "new-test-rating-100"
		resData["numeric_value"] = 2
		e.PUT(path).
			WithPath("rating_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"name":          "New Test Rating 100",
				"slug":          "new-test-rating-100",
				"numeric_value": 2,
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"name":          "New Test Rating 100",
				"slug":          "new-test-rating-100",
				"numeric_value": 2,
			})
	})

	// update rating by id with empty slug
	t.Run("update rating by id with empty slug", func(t *testing.T) {
		resData["name"] = "Test Rating Updated Again once"
		resData["slug"] = "test-rating-updated-again-once"
		resData["numeric_value"] = 30
		e.PUT(path).
			WithPath("rating_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"name":          "Test Rating Updated Again once",
				"slug":          "test-rating-updated-again-once",
				"numeric_value": 30,
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"name":          "Test Rating Updated Again once",
				"slug":          "test-rating-updated-again-once",
				"numeric_value": 30,
			})
	})

	// update rating with different slug
	t.Run("update rating with different slug", func(t *testing.T) {
		resData["name"] = "Test Rating Updated Again 2"
		resData["slug"] = "test-rating-updated-again-2"
		resData["numeric_value"] = 4
		e.PUT(path).
			WithPath("rating_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"name":          "Test Rating Updated Again 2",
				"slug":          "test-rating-updated-again-2",
				"numeric_value": 4,
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"name":          "Test Rating Updated Again 2",
				"slug":          "test-rating-updated-again-2",
				"numeric_value": 4,
			})
	})

	// update rating with same name
	t.Run("update rating with same name", func(t *testing.T) {
		id := insertData.ID
		insertData.Name = TestName
		insertData.Slug = TestSlug
		insertData.ID = 10000
		config.DB.Model(&model.Rating{}).Create(&insertData)
		e.PUT(path).
			WithPath("rating_id", id).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"name":          TestName,
				"slug":          TestSlug,
				"numeric_value": 4,
			}).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("invalid space header", func(t *testing.T) {
		e.POST(basePath).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnauthorized)
	})
}
