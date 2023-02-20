package menu

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCreateMenu(t *testing.T) {
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

	config.DB.Model(&model.Menu{}).Create(&insertData)
	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	//test to check unprocessable menu
	t.Run("unprocessable menu", func(t *testing.T) {

		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// Create a menu
	t.Run("Successful create menu", func(t *testing.T) {

		e.POST(basePath).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(Data)
	})

	t.Run("undecodable menu", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	//menu with same name
	t.Run("create menu with same name", func(t *testing.T) {
		Data["name"] = insertData.Name
		e.POST(basePath).
			WithJSON(Data).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

}
