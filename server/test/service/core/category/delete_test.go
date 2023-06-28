package category

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

func TestCategoryDelete(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM categories")
	insertData := model.Category{
		Name:             "Delete Test Data",
		Slug:             "",
		BackgroundColour: TestBackgroundColour,
		FooterCode:       TestFooterCode,
		HeaderCode:       TestHeaderCode,
		MetaFields:       TestMetaFields,
		Meta:             TestMeta,
		Description:      TestDescriptionFromRequest,
		MediumID:         &TestMediumId,
		ParentID:         &TestParentID,
		SpaceID:          1,
	}

	config.DB.Create(&insertData)
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid category id", func(t *testing.T) {
		e.DELETE(path).
			WithPath("category_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("category record not found", func(t *testing.T) {
		e.DELETE(path).
			WithPath("category_id", "100000000000").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)

	})

	t.Run("delete a category", func(t *testing.T) {

		e.DELETE(path).
			WithPath("category_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})
}
