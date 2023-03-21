package post

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

func TestPostDelete(t *testing.T) {

	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM media")
	config.DB.Exec("DELETE FROM space_permissions")
	config.DB.Exec("DELETE FROM posts")
	config.DB.Exec("DELETE FROM authors")
	config.DB.Exec("DELETE FROM formats")
	var insertArthorData model.Author
	var insertMediumData model.Medium
	var insertSpacePermission model.SpacePermission
	var insertFormatData model.Format
	var insertPostAuthorData model.PostAuthor
	insertArthorData = model.Author{
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
		Excerpt:          TestExcerpt,
		HeaderCode:       TestHeaderCode,
		FooterCode:       TestFooterCode,
		MetaFields:       TestMetaFields,
		DescriptionAMP:   TestDescriptionHtml,
		Tags:             []model.Tag{},
		Categories:       []model.Category{},
	}
	insertMediumData = model.Medium{
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
	insertSpacePermission = model.SpacePermission{
		SpaceID:   1,
		FactCheck: true,
		Media:     10,
		Posts:     10,
		Podcast:   true,
		Episodes:  10,
		Videos:    10,
	}
	insertFormatData = model.Format{
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
	insertData.Title = "Create Data Test"
	insertData.Slug = "create-data-test"
	insertData.ID = 10000
	config.DB.Create(&insertData)
	insertPostAuthorData = model.PostAuthor{
		AuthorID: insertArthorData.ID,
		PostID:   insertArthorData.ID,
	}
	config.DB.Create(&insertPostAuthorData)
	resData["format_id"] = insertFormatData.ID
	resData["title"] = "TestTitle"
	resData["slug"] = "test-title-2"
	delete(resData, "authors")

	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid post id", func(t *testing.T) {
		e.DELETE(path).
			WithPath("post_id", "invalid-post-id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("post record not found", func(t *testing.T) {
		e.DELETE(path).
			WithPath("post_id", 100000000000).
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("post record deleted", func(t *testing.T) {
		e.DELETE(path).
			WithPath("post_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
	})

}
