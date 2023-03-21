package medium

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

func TestMediumDetails(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	var resData = map[string]interface{}{
		"name":        TestName,
		"type":        TestType,
		"title":       TestTitle,
		"description": TestDescription,
		"caption":     TestCaption,
		"alt_text":    TestAltText,
		"file_size":   TestFileSize,
		"url":         TestUrl,
		"dimensions":  TestDimensions,
		"meta_fields": TestMetaFields,
	}
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM media")
	var insertData = &model.Medium{
		Name:        TestName,
		Slug:        TestSlug,
		Description: TestDescription,
		Type:        TestType,
		Title:       TestTitle,
		Caption:     TestCaption,
		AltText:     TestAltText,
		FileSize:    TestFileSize,
		URL:         TestUrl,
		Dimensions:  TestDimensions,
		MetaFields:  TestMetaFields,
		SpaceID:     TestSpaceID,
	}
	config.DB.Create(insertData)

	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid medium id", func(t *testing.T) {
		e.GET(path).
			WithPath("medium_id", "invalid").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("get medium by id", func(t *testing.T) {
		e.GET(path).
			WithPath("medium_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)
	})

}
