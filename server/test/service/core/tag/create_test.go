package tag

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestTagCreate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM tags")
	config.DB.Create(&model.Tag{
		Name:             "Insert Data Test",
		Description:      TestDescriptionJson,
		DescriptionHTML:  TestDescriptionHtml,
		Slug:             "insert-data-test",
		MediumID:         &Data.MediumID,
		MetaFields:       Data.MetaFields,
		Meta:             Data.Meta,
		FooterCode:       Data.FooterCode,
		HeaderCode:       Data.HeaderCode,
		BackgroundColour: Data.BackgroundColour,
		IsFeatured:       Data.IsFeatured,
		SpaceID:          TestSpaceId,
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

	t.Run("Unprocessable tag", func(t *testing.T) {
		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("Unable to decode tag", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("create tag", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(resData)
	})

	t.Run("creating same name exists", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("ceate tag with slug is empty", func(t *testing.T) {
		Data.Slug = ""
		Data.Name = "Test Create Tag Test"
		resData["name"] = "Test Create Tag Test"
		resData["slug"] = "test-create-tag-test"

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(resData)
	})

	t.Run("cannot parse tag description", func(t *testing.T) {

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"name":        "Test Create Tag Test",
				"description": "descriptionn",
			}).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
}
