package format

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

func TestPageUpdate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM media")
	config.DB.Exec("DELETE FROM formats")
	var insertMediumData model.Medium
	var insertFormatData model.Format
	insertMediumData = model.Medium{
		Name:        "Create Medium Test",
		Slug:        "create-medium-test",
		Description: "desc",
		Type:        "jpg",
		Title:       "Sample image",
		Caption:     "caption",
		AltText:     "TestAltText",
		FileSize:    100,
		URL: postgres.Jsonb{
			RawMessage: []byte(`{"raw":"http://testimage.com/test.jpg"}`),
		},
		Dimensions: "TestDimensions",
		MetaFields: TestMetaFields,
		SpaceID:    TestSpaceID,
	}
	config.DB.Model(&model.Medium{}).Create(&insertMediumData)
	insertFormatData = model.Format{
		Name:        TestName,
		Slug:        TestSlug,
		Description: TestDescription,
		SpaceID:     TestSpaceID,
		FooterCode:  TestFooterCode,
		HeaderCode:  TestHeaderCode,
		MediumID:    &insertMediumData.ID,
		MetaFields:  TestMetaFields,
	}

	config.DB.Model(&model.Format{}).Create(&insertFormatData)

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)
	t.Run("invalid format id", func(t *testing.T) {
		e.PUT(path).
			WithPath("format_id", "invalid_id").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("format record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("format_id", "100000").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("unable to decode format data", func(t *testing.T) {
		e.PUT(path).
			WithPath("format_id", insertFormatData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("unprocessable format", func(t *testing.T) {
		e.PUT(path).
			WithPath("format_id", insertFormatData.ID).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("update format", func(t *testing.T) {
		Data["name"] = "Update Format Test"
		Data["slug"] = "update-format-test"
		resData["name"] = "Update Format Test"
		resData["slug"] = "update-format-test"
		e.PUT(path).
			WithPath("format_id", insertFormatData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)
	})

	t.Run("update format with empty slug", func(t *testing.T) {
		Data["name"] = "Update Format Test 2"
		Data["slug"] = ""
		resData["name"] = "Update Format Test 2"
		resData["slug"] = "update-format-test-2"
		e.PUT(path).
			WithPath("format_id", insertFormatData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)
	})

	t.Run("update format with different slug", func(t *testing.T) {
		Data["name"] = "Update Format Test"
		Data["slug"] = "update-format-test-87"
		resData["name"] = "Update Format Test"
		resData["slug"] = "update-format-test-87"
		e.PUT(path).
			WithPath("format_id", insertFormatData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)
	})

	t.Run("update format with same name", func(t *testing.T) {
		id := insertFormatData.ID
		insertFormatData.ID = 1000000
		insertFormatData.Name = "New Name"
		insertFormatData.Slug = "new-name"
		config.DB.Model(&model.Format{}).Create(&insertFormatData)
		Data["name"] = insertFormatData.Name

		e.PUT(path).
			WithPath("format_id", id).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
}
