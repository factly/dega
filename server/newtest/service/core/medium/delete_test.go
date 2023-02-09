package medium

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"

	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestMediumDelete(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM tags")
	var insertData = &model.Medium{
		Name:        "Create Medium Test",
		Slug:        "create-medium-test",
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
	//create associations
	var insertDataAsc = &model.Medium{
		Name:        "Create Medium Test 2",
		Slug:        "create-medium-test 2",
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
	config.DB.Create(insertDataAsc)

	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid medium id", func(t *testing.T) {
		e.DELETE(path).
			WithPath("medium_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("medium record not found", func(t *testing.T) {
		e.DELETE(path).
			WithPath("medium_id", "1000000").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("medium record deleted", func(t *testing.T) {
		e.DELETE(path).
			WithPath("medium_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})

	t.Run("check medium associated with other posts", func(t *testing.T) {
		insertPostData := &model.Post{
			Title:   "Test Title",
			Slug:    "test-title",
			Medium:  insertDataAsc,
			SpaceID: TestSpaceID,
		}
		if err := config.DB.Create(&insertPostData).Error; err != nil {
			log.Fatal(err)
		}
		if err := config.DB.Model(insertPostData).Association("Medium").Replace(insertDataAsc); err != nil {
			log.Fatal(err)
		}
		e.DELETE(path).
			WithPath("medium_id", insertDataAsc.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		if err := config.DB.Model(insertPostData).Association("Medium").Replace([]model.Medium{}); err != nil {
			log.Fatal(err)
		}
	})

	t.Run("check medium associated with other categories", func(t *testing.T) {
		insertCategoryData := &model.Category{
			Name:     "Category Name",
			Slug:     "category-name",
			MediumID: &insertDataAsc.ID,
			SpaceID:  TestSpaceID,
		}
		config.DB.Create(insertCategoryData)

		if err := config.DB.Model(insertCategoryData).Association("Medium").Replace(insertDataAsc); err != nil {
			log.Fatal(err)
		}
		e.DELETE(path).
			WithPath("medium_id", insertDataAsc.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		if err := config.DB.Model(insertCategoryData).Association("Medium").Replace([]model.Medium{}); err != nil {
			log.Fatal(err)
		}
	})

	t.Run("check medium associated with other rating", func(t *testing.T) {
		insertRatingData := factCheckModel.Rating{
			Name:     "Rating",
			Slug:     "rating",
			MediumID: &insertDataAsc.ID,
			SpaceID:  TestSpaceID,
		}

		config.DB.Create(&insertRatingData)
		if err := config.DB.Model(&insertRatingData).Association("Medium").Replace(insertDataAsc); err != nil {
			log.Fatal(err)
		}

		e.DELETE(path).
			WithPath("medium_id", insertDataAsc.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		if err := config.DB.Model(&insertRatingData).Association("Medium").Replace([]model.Medium{}); err != nil {
			log.Fatal(err)
		}
	})

	t.Run("check medium associated with other claimants", func(t *testing.T) {
		insertClaimantData := factCheckModel.Claimant{
			Name:     "Name",
			Slug:     "name",
			MediumID: &insertDataAsc.ID,
			SpaceID:  TestSpaceID,
		}

		config.DB.Create(&insertClaimantData)
		if err := config.DB.Model(&insertClaimantData).Association("Medium").Replace(insertDataAsc); err != nil {
			log.Fatal(err)
		}
		e.DELETE(path).
			WithPath("medium_id", insertDataAsc.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		if err := config.DB.Model(&insertClaimantData).Association("Medium").Replace([]model.Medium{}); err != nil {
			log.Fatal(err)
		}
	})
}
