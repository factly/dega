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

func TestFormatList(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM media")
	config.DB.Exec("DELETE FROM formats")
	var insertMediumData model.Medium
	var insertData model.Format
	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list", func(t *testing.T) {

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})
	})

	t.Run("get non-empty list of media", func(t *testing.T) {
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
		config.DB.Create(&insertMediumData)
		insertData = model.Format{
			Name:        TestName,
			Slug:        TestSlug,
			Description: TestDescription,
			MetaFields:  TestMetaFields,
			SpaceID:     TestSpaceID,
			MediumID:    &insertMediumData.ID,
			FooterCode:  TestFooterCode,
			HeaderCode:  TestHeaderCode,
		}
		config.DB.Create(&insertData)
		insertData.ID = 100000
		insertData.Name = "TestName2"
		insertData.Slug = "test-name-2"
		config.DB.Create(&insertData)
		resData["name"] = "TestName2"
		resData["slug"] = "test-name-2"
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 2}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)
	})

	t.Run("get formats with pagination", func(t *testing.T) {
		resData["name"] = TestName
		resData["slug"] = TestSlug
		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{"page": 2, "limit": 1}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 2}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)

	})
}
