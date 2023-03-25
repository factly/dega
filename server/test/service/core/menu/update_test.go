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

func TestMenuUpdate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM menus")

	var insertData = model.Menu{
		Name:       "Test Menu",
		Slug:       "test-menu",
		Menu:       TestMenu,
		MetaFields: TestMetaFields,
		SpaceID:    TestSpaceID,
	}

	config.DB.Model(&model.Menu{}).Create(&insertData)

	e := httpexpect.New(t, testServer.URL)

	// invalid menu id
	t.Run("invalid menu id", func(t *testing.T) {
		e.PUT(path).
			WithPath("menu_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	// undeecodable menu
	t.Run("undecodable menu", func(t *testing.T) {
		e.PUT(path).
			WithPath("menu_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// invaid menu data
	t.Run("invaid menu data", func(t *testing.T) {
		e.PUT(path).
			WithPath("menu_id", 1).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// menu not found
	t.Run("menu not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("menu_id", 100000000).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	// update menu
	t.Run("update menu", func(t *testing.T) {
		e.PUT(path).
			WithPath("menu_id", insertData.ID).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(Data)
	})

	// record with same exists
	t.Run("record with same exists", func(t *testing.T) {
		id := insertData.ID
		insertData.ID = 10000000000000
		insertData.Name = "Test Menu 2"
		insertData.Slug = "test-menu-2"
		config.DB.Model(&model.Menu{}).Create(&insertData)
		Data["name"] = insertData.Name
		Data["slug"] = insertData.Slug
		e.PUT(path).
			WithPath("menu_id", id).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
}
