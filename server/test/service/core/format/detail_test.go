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

func TestFormatDetails(t *testing.T) {

	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM media")
	config.DB.Exec("DELETE FROM formats")

	var insertData model.Format
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
	insertData = model.Format{
		Name:        TestName,
		Slug:        TestSlug,
		Description: TestDescription,
		SpaceID:     TestSpaceID,
		FooterCode:  TestFooterCode,
		HeaderCode:  TestHeaderCode,
		MediumID:    &insertMediumData.ID,
		MetaFields:  TestMetaFields,
	}
	config.DB.Model(&model.Format{}).Create(&insertData)

	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid format id", func(t *testing.T) {
		e.GET(path).
			WithPath("format_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("format record not found", func(t *testing.T) {
		e.GET(path).
			WithPath("format_id", "1000000").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("get format by id", func(t *testing.T) {
		resData["name"] = insertData.Name
		resData["slug"] = insertData.Slug

		e.GET(path).
			WithPath("format_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).JSON().Object().ContainsMap(resData)
	})
}
