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
	"gopkg.in/h2non/gock.v1"
)

func TestTagDetails(t *testing.T) {

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM tags")
	insertData := model.Tag{
		Name:             TestName,
		Description:      TestDescriptionJson,
		DescriptionHTML:  TestDescriptionHtml,
		Slug:             TestSlug,
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

	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid tag id", func(t *testing.T) {
		e.GET(path).
			WithPath("tag_id", "invalid").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("tag record not found", func(t *testing.T) {
		e.GET(path).
			WithPath("tag_id", 10000000).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("get a tag by id", func(t *testing.T) {
		resData["name"] = TestName
		resData["slug"] = TestSlug
		e.GET(path).
			WithPath("tag_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)
	})

}
