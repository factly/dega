package medium

import (
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

func TestMediumUpdate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	var updatedMedium = map[string]interface{}{
		"name":        "Image",
		"type":        "jpg",
		"title":       "Sample image",
		"description": "desc",
		"caption":     "sample",
		"alt_text":    "sample",
		"file_size":   100,
		"url": postgres.Jsonb{
			RawMessage: []byte(`{"raw":"http://testimage.com/test.jpg"}`),
		},
		"dimensions": "testdims",
		"meta_fields": postgres.Jsonb{
			RawMessage: []byte(`{"type":"meta field"}`),
		},
	}
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM media")
	var insertData = &model.Medium{
		Name:        "Create Medium Test",
		Slug:        "create-medium-test",
		Description: TestDescription,
		Type:        TestType,
		Title:       TestTitle,
		Caption:     TestCaption,
		AltText:     TestAltText,
		FileSize:    TestFileSize,
		URL:         TestUrl,
		Dimensions:  TestDimensions,
		MetaFields:  TestMetaFields,
		SpaceID:     TestSpaceID,
	}
	config.DB.Create(insertData)

	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid medium id", func(t *testing.T) {
		e.PUT(path).
			WithPath("medium_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("medium record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("medium_id", "10000000000").
			WithHeaders(headers).
			WithJSON(updatedMedium).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("unable to decode medium data", func(t *testing.T) {
		e.PUT(path).
			WithPath("medium_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("unprocessable medium", func(t *testing.T) {
		e.PUT(path).
			WithPath("medium_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("update medium", func(t *testing.T) {
		e.PUT(path).
			WithPath("medium_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(updatedMedium).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(updatedMedium)
	})

	t.Run("update medium by id with empty slug", func(t *testing.T) {
		updatedMedium["slug"] = ""

		res := e.PUT(path).
			WithPath("medium_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(updatedMedium).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object()
		updatedMedium["slug"] = "image-1"

		res.ContainsMap(updatedMedium)
	})

	t.Run("update medium with different slug", func(t *testing.T) {
		updatedMedium["slug"] = "image-slug"
		e.PUT(path).
			WithPath("medium_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(updatedMedium).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(updatedMedium)
	})

	t.Run("medium not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("medium_id", 1000000000000000000).
			WithHeaders(headers).
			WithJSON(updatedMedium).
			Expect().
			Status(http.StatusNotFound)
	})

}
