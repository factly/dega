package category

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/slugx"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCategoryDetails(t *testing.T) {
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM categories")
	insertData := model.Category{
		DescriptionHTML:  TestDescriptionHtml,
		Description:      TestDescriptionJson,
		Name:             "Details Category Test",
		Slug:             slugx.Make("Details Category Test"),
		BackgroundColour: Data.BackgroundColour,
		ParentID:         Data.ParentID,
		MediumID:         Data.MediumID,
		IsFeatured:       Data.IsFeatured,
		SpaceID:          1,
		MetaFields:       Data.MetaFields,
		Meta:             Data.Meta,
		HeaderCode:       Data.HeaderCode,
		FooterCode:       Data.FooterCode,
	}
	config.DB.Model(&model.Category{}).Create(&insertData)
	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid category id", func(t *testing.T) {
		e.GET(path).
			WithPath("category_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("record not found", func(t *testing.T) {
		e.GET(path).
			WithPath("category_id", "1000000").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("get category by id", func(t *testing.T) {
		resData["parent_id"] = 0
		resData["name"] = "Details Category Test"
		resData["slug"] = slugx.Make("Details Category Test")
		e.GET(path).
			WithPath("category_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)
	})
}
