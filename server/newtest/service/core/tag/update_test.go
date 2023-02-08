package tag

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestTagUpdate(t *testing.T) {

	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM tags")
	insertData := model.Tag{
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
	}

	if err := config.DB.Model(&model.Tag{}).Create(&insertData).Error; err != nil {
		log.Fatal(err)
	}
	insertData.Name = "Insert Data Test 2"
	insertData.ID = 3
	config.DB.Model(&model.Tag{}).Create(&insertData)

	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid tag id", func(t *testing.T) {
		e.PUT(path).
			WithPath("tag_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("tag record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("tag_id", "10000000000").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("Unable to decode tag data", func(t *testing.T) {
		e.PUT(path).
			WithPath("tag_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("Unprocessable tag", func(t *testing.T) {
		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("update tag", func(t *testing.T) {
		updatedTag := map[string]interface{}{
			"name":        "Elections",
			"slug":        "elections",
			"is_featured": true,
			"background_colour": postgres.Jsonb{
				RawMessage: []byte(`{"colour":"#6787"}`),
			},
		}

		e.PUT(path).
			WithPath("tag_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(updatedTag).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(updatedTag)
	})

	t.Run("update tag by ud with empty slug", func(t *testing.T) {
		updatedTag := map[string]interface{}{
			"name": "NewElections",
			"slug": "",
		}

		res := e.PUT(path).
			WithPath("tag_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(updatedTag).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object()

		updatedTag["slug"] = "newelections"

		res.ContainsMap(updatedTag)
	})

	t.Run("update tag with different slug", func(t *testing.T) {
		updatedTag := map[string]interface{}{
			"name": "Elections",
			"slug": "testing-slug",
		}

		e.PUT(path).
			WithPath("tag_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(updatedTag).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(updatedTag)
	})

	t.Run("tag with same name exists", func(t *testing.T) {
		updatedTag := map[string]interface{}{
			"name": "Insert Data Test",
			"slug": "elections",
		}

		e.PUT(path).
			WithPath("tag_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(updatedTag).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("cannot parse tag description", func(t *testing.T) {
		e.PUT(path).
			WithPath("tag_id", 1).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"description": postgres.Jsonb{
					RawMessage: []byte(`{"block": "new"}`)},
			}).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
}
