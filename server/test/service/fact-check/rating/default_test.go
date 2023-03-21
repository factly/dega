package rating

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/fact-check/action/rating"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestRatingDefault(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM ratings")
	config.DB.Exec("DELETE FROM space_permissions")
	config.DB.Exec("DELETE FROM media")
	var insertSpacePermissionData = coreModel.SpacePermission{
		SpaceID:   TestSpaceID,
		FactCheck: true,
		Media:     100,
		Posts:     100,
		Podcast:   true,
		Episodes:  100,
		Videos:    100,
	}

	var insertMediumData = coreModel.Medium{
		Name:    "Test Medium",
		Slug:    "test-medium",
		SpaceID: TestSpaceID,
	}

	config.DB.Model(&coreModel.SpacePermission{}).Create(&insertSpacePermissionData)
	config.DB.Model(&coreModel.Medium{}).Create(&insertMediumData)
	var insertData = model.Rating{
		Name:             "Test Rating",
		Slug:             "test-rating",
		BackgroundColour: TestBackgroundColour,
		TextColour:       TestTextColour,
		Description:      TestDescriptionJson,
		DescriptionHTML:  TestDescriptionHtml,
		NumericValue:     TestNumericValue,
		MediumID:         &insertMediumData.ID,
		Medium:           &insertMediumData,
		SpaceID:          TestSpaceID,
		FooterCode:       TestFooterCode,
		HeaderCode:       TestHeaderCode,
	}
	if err := config.DB.Model(&model.Rating{}).Create(&insertData).Error; err != nil {
		log.Fatal(err)
	}
	e := httpexpect.New(t, testServer.URL)
	rating.DataFile = "./testDefault.json"

	t.Run("create default rating", func(t *testing.T) {
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			Value("nodes").
			Array()
	})

	t.Run("default rating already created", func(t *testing.T) {
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			Value("nodes").
			Array()
	})
	t.Run("when cannot open data file", func(t *testing.T) {
		rating.DataFile = "nofile.json"
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("when cannot parse data file", func(t *testing.T) {
		rating.DataFile = "invalidData.json"
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})
}
