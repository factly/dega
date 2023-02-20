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

func TestMenuDelete(t *testing.T) {

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
		e.DELETE(path).
			WithPath("menu_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	// menu record not found
	t.Run("menu record not found", func(t *testing.T) {
		e.DELETE(path).
			WithPath("menu_id", 100).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	// delete menu
	t.Run("delete menu", func(t *testing.T) {
		e.DELETE(path).
			WithPath("menu_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})
}
