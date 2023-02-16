package page

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"
	"github.com/gavv/httpexpect"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestPageCreate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM posts")
	var insertArthorData = model.Author{
		FirstName: "Arthur",
		LastName:  "Dent",
	}
	config.DB.Create(&insertArthorData)
	var insertData model.Post = model.Post{
		Title:            "TestTitle",
		Subtitle:         TestSubTitle,
		Slug:             "test-title-2",
		Description:      TestDescriptionJson,
		DescriptionHTML:  TestDescriptionHtml,
		Status:           TestStatus,
		IsPage:           TestIsPage,
		IsHighlighted:    TestIsHighlighted,
		FeaturedMediumID: &TestFeaturedMediumID,
		FormatID:         TestFormatID,
		SpaceID:          TestSpaceID,
		Meta:             TestMeta,
		HeaderCode:       TestHeaderCode,
		FooterCode:       TestFooterCode,
		MetaFields:       TestMetaFields,
		DescriptionAMP:   TestDescriptionHtml,
		Tags:             []model.Tag{},
		Categories:       []model.Category{},
	}
	var insertMediumData = model.Medium{
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
	insertSpacePermission := model.SpacePermission{
		SpaceID:   1,
		FactCheck: true,
		Media:     10,
		Posts:     10,
		Podcast:   true,
		Episodes:  10,
		Videos:    10,
	}
	insertFormatData := model.Format{
		Name:        "Create Format Test",
		Slug:        "create-format-test",
		Description: "desc",
		SpaceID:     TestSpaceID,
	}
	if err := config.DB.Create(&insertFormatData).Error; err != nil {
		log.Fatal(err)
	}
	if err := config.DB.Create(&insertMediumData).Error; err != nil {
		log.Fatal(err)
	}
	if err := config.DB.Create(&insertSpacePermission).Error; err != nil {
		log.Fatal(err)
	}
	if err := config.DB.Create(&insertData).Error; err != nil {
		log.Fatal(err)
	}
	Data["author_ids"] = []int{int(insertArthorData.ID)}
	Data["format_id"] = insertFormatData.ID
	resData["format_id"] = insertFormatData.ID
	e := httpexpect.New(t, testServer.URL)

	t.Run("unprocessable post", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("Undecodable post", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("parsing description fails", func(t *testing.T) {
		Data["description"] = "invalid"

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)

		Data["description"] = TestDescriptionFromRequest
	})

	t.Run("create post", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(resData)
	})

}
