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

func TestFormatCreate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM formats")
	config.DB.Exec("DELETE FROM media")
	var insertMediumData = model.Medium{
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
	var insertData = model.Format{
		Name:        "New Format",
		Slug:        "new-format",
		Description: TestDescription,
		MetaFields:  TestMetaFields,
		SpaceID:     TestSpaceID,
		FooterCode:  TestFooterCode,
		HeaderCode:  TestHeaderCode,
		MediumID:    &insertMediumData.ID,
	}
	config.DB.Model(&model.Format{}).Create(&insertData)
	Data["medium_id"] = insertMediumData.ID
	resData["medium_id"] = insertMediumData.ID
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable format", func(t *testing.T) {
		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("Unable to decode format", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("Create format", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(resData)
	})

	t.Run("create format with empty slug", func(t *testing.T) {
		Data["slug"] = ""
		Data["name"] = "New Format 2"
		resData["slug"] = "new-format-2"
		resData["name"] = "New Format 2"
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(resData)
	})

	t.Run("create format with same name", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
}
