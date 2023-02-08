package categories

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"
	"github.com/gavv/httpexpect"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestCategoryCreate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM categories")
	config.DB.Create(&model.Category{
		DescriptionHTML:  TestDescriptionHtml,
		Description:      TestDescriptionJson,
		Name:             Data.Name,
		Slug:             Data.Slug,
		BackgroundColour: Data.BackgroundColour,
		ParentID:         Data.ParentID,
		MediumID:         Data.MediumID,
		IsFeatured:       Data.IsFeatured,
		SpaceID:          Data.SpaceID,
		MetaFields:       Data.MetaFields,
		Meta:             Data.Meta,
		HeaderCode:       Data.HeaderCode,
		FooterCode:       Data.FooterCode,
	})
	config.DB.Create(&model.Medium{
		Name:        mediumData.Name,
		Slug:        mediumData.Slug,
		Type:        mediumData.Type,
		Title:       mediumData.Title,
		Description: mediumData.Description,
		Caption:     mediumData.Caption,
		AltText:     mediumData.AltText,
		FileSize:    mediumData.FileSize,
		URL:         mediumData.URL,
		Dimensions:  mediumData.Dimensions,
		SpaceID:     mediumData.SpaceID,
		MetaFields:  mediumData.MetaFields,
	})
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable category", func(t *testing.T) {
		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("Unable to decode category", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("create category without parent", func(t *testing.T) {
		resData["parent_id"] = nil
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(resData)
		resData["parent_id"] = 0
	})

	t.Run("parent category does not exist", func(t *testing.T) {
		TestParentID = 2
		fmt.Println("this the parent", *Data.ParentID)
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		TestParentID = 0
	})

	t.Run("create category with empty slug", func(t *testing.T) {
		Data.Slug = ""
		Data.Name = "New Test Category"
		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).JSON().Object()
		resData["name"] = "New Test Category"
		resData["slug"] = "new-test-category"
		resData["parent_id"] = nil
		res.ContainsMap(resData)
		resData["parent_id"] = 0

	})

	t.Run("medium does not belong to same space", func(t *testing.T) {
		headers["X-Space"] = "4"
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		headers["X-Space"] = "1"
	})

	t.Run("when category with same name exists", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("cannot parses category description", func(t *testing.T) {
		Data.Description = postgres.Jsonb{
			RawMessage: []byte(`{"block": "new"}`),
		}
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data.Description = postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
		}
	})
}
