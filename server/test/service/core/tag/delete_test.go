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

func TestTagDelete(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM tags")
	insertData := model.Tag{
		Name:             "Insert Data Test",
		Description:      TestDescriptionJson,
		DescriptionHTML:  TestDescriptionHtml,
		Slug:             "insert-data-test",
		MediumID:         &Data.MediumID,
		MetaFields:       Data.MetaFields,
		Meta:             Data.Meta,
		FooterCode:       Data.FooterCode,
		HeaderCode:       Data.HeaderCode,
		BackgroundColour: Data.BackgroundColour,
		IsFeatured:       Data.IsFeatured,
		SpaceID:          TestSpaceId,
	}
	insertPostData := model.Post{
		Title:   "Test Title",
		Slug:    "test-title",
		Tags:    []model.Tag{insertData},
		SpaceID: TestSpaceId,
	}

	if err := config.DB.Model(&model.Tag{}).Create(&insertData).Error; err != nil {
		log.Fatal(err)
	}
	if err := config.DB.Model(&model.Post{}).Create(&insertPostData).Error; err != nil {
		log.Fatal(err)
	}
	if err := config.DB.Model(&insertData).Association("Posts").Replace(&insertPostData); err != nil {
		log.Fatal(err)
	}
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid tag id", func(t *testing.T) {
		e.DELETE(path).
			WithPath("tag_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("tag record not found", func(t *testing.T) {
		e.DELETE(path).
			WithPath("tag_id", "1000000").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})
	t.Run("check tag associated with other entity", func(t *testing.T) {
		e.DELETE(path).
			WithPath("tag_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("tag record deleted", func(t *testing.T) {
		insertData2 := model.Tag{
			Name:             "Insert Data Test 2",
			Description:      TestDescriptionJson,
			DescriptionHTML:  TestDescriptionHtml,
			Slug:             "insert-data-test-2",
			MediumID:         &Data.MediumID,
			MetaFields:       Data.MetaFields,
			Meta:             Data.Meta,
			FooterCode:       Data.FooterCode,
			HeaderCode:       Data.HeaderCode,
			BackgroundColour: Data.BackgroundColour,
			IsFeatured:       Data.IsFeatured,
			SpaceID:          TestSpaceId,
		}
		if err := config.DB.Model(&model.Tag{}).Create(&insertData2).Error; err != nil {
			log.Fatal(err)
		}
		// log.Fatal("@@@@@@@@@@@@@@@", config.DB.Model(insertData2).Association("Posts").Count())
		e.DELETE(path).
			WithPath("tag_id", insertData2.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})
}
