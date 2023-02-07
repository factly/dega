package categories

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCategoryUpdate(t *testing.T) {
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	// insert test data
	insertData := model.Category{
		Name:             "new test",
		Slug:             "new-test",
		HeaderCode:       TestHeaderCode,
		Description:      TestDescriptionFromRequest,
		FooterCode:       TestFooterCode,
		BackgroundColour: TestBackgroundColour,
		MediumID:         &TestMediumId,
		ParentID:         &TestParentID,
		MetaFields:       TestMetaFields,
		Meta:             TestMeta,
		IsFeatured:       TestIsFeatured,
		SpaceID:          1,
	}
	config.DB.Exec("DELETE FROM categories")
	config.DB.Model(&model.Category{}).Create(&insertData)
	//update the name and ID to resolve unique constraints errors
	insertData.Name = "new test 2"
	insertData.ID = 3
	config.DB.Model(&model.Category{}).Create(&insertData)

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid category id", func(t *testing.T) {
		e.PUT(path).
			WithPath("category_id", "invalid_id").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("category record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("category_id", "100000").
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("Unable to decode category data", func(t *testing.T) {
		e.PUT(path).
			WithPath("category_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("unprocessable category", func(t *testing.T) {
		e.PUT(path).
			WithPath("category_id", "1").
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("update category", func(t *testing.T) {
		e.PUT(path).
			WithPath("category_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"name": "update test",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"name": "update test",
				"slug": "update-test",
			})
	})

	t.Run("update category with empty slug", func(t *testing.T) {
		e.PUT(path).
			WithPath("category_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"name": "Updated Test Again",
				"slug": "",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"name": "Updated Test Again",
				"slug": "updated-test-again",
			})
	})

	t.Run("update category with parent set", func(t *testing.T) {
		e.PUT(path).
			WithPath("category_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"parent_id": 1,
				"name":      "Update Parent",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"parent_id": 1,
				"name":      "Update Parent",
				"slug":      "update-parent",
			})
	})

	t.Run("parent category not found in space", func(t *testing.T) {
		e.PUT(path).
			WithPath("category_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"name":      "Parent Update Test",
				"parent_id": 10000000,
			}).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("update category with its own parent id", func(t *testing.T) {
		e.PUT(path).
			WithPath("category_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"parent_id": insertData.ID,
			}).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("update category with medium id = 0", func(t *testing.T) {
		e.PUT(path).
			WithPath("category_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"medium_id": nil,
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"medium_id": 0,
			})
	})
}
