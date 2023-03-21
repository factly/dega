package menu

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

func TestMenuList(t *testing.T) {

	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	config.DB.Exec("DELETE FROM menus")

	var insertData = model.Menu{
		Name:       "Test Menu",
		Slug:       "test-menu",
		Menu:       TestMenu,
		MetaFields: TestMetaFields,
		SpaceID:    TestSpaceID,
	}

	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of menu", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ValueEqual("total", 0).
			Value("nodes").
			Array().
			Empty()
	})

	t.Run("get list of menu", func(t *testing.T) {
		config.DB.Model(&model.Menu{}).Create(&insertData)
		insertData.ID = 1000000
		insertData.Name = TestName
		insertData.Slug = TestSlug
		config.DB.Model(&model.Menu{}).Create(&insertData)
		Data["name"] = TestName
		Data["slug"] = TestSlug
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ValueEqual("total", 2).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(Data)
	})

	// get non empty list of menu with pagination
	t.Run("get non empty list of menu with pagination", func(t *testing.T) {
		Data["name"] = "Test Menu"
		Data["slug"] = "test-menu"
		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"page":  2,
				"limit": 1,
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ValueEqual("total", 2).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(Data)
	})
}
