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

func TestPageUpdate(t *testing.T) {
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
	var insertFormatData model.Format
	var insertPostAuthorData model.PostAuthor
	var insertData model.Post
	insertArthorData = model.Author{
		FirstName: "Arthur",
		LastName:  "Dent",
	}
	config.DB.Create(&insertArthorData)
	insertData = model.Post{
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

	insertFormatData = model.Format{
		Name:        "Create Format Test",
		Slug:        "create-format-test",
		Description: "desc",
		SpaceID:     TestSpaceID,
	}
	insertFormatData.ID = TestFormatID

	if err := config.DB.Create(&insertFormatData).Error; err != nil {
		log.Fatal(err)
	}
	if err := config.DB.Create(&insertMediumData).Error; err != nil {
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

	t.Run("invalid page id", func(t *testing.T) {
		e.PUT(path).
			WithPath("page_id", "invalid_id").
			WithHeaders(headers).
			WithJSON(resData).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("page record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("page_id", "1000000000000000").
			WithHeaders(headers).
			WithJSON(resData).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("invalid page body", func(t *testing.T) {
		e.PUT(path).
			WithPath("page_id", insertData.ID).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("undecodable page body", func(t *testing.T) {
		e.PUT(path).
			WithPath("page_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("cannot parse page description", func(t *testing.T) {
		Data["description"] = "invalid_description"
		e.PUT(path).
			WithPath("page_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["description"] = TestDescriptionFromRequest
	})

	t.Run("update page", func(t *testing.T) {
		Data["title"] = "TestTitle10000"
		Data["slug"] = "test-title-10000"
		Data["format_id"] = insertFormatData.ID
		resData["title"] = "TestTitle10000"
		resData["slug"] = "test-title-10000"
		e.PUT(path).
			WithPath("page_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)

		resData["title"] = TestTitle
		resData["slug"] = TestSlug
		Data["title"] = TestTitle
		Data["slug"] = TestSlug
	})

	t.Run("update page with featured_mediium_id = 0", func(t *testing.T) {
		Data["featured_medium_id"] = 0
		Data["title"] = TestTitle
		Data["slug"] = TestSlug
		Data["format_id"] = insertFormatData.ID
		resData["title"] = TestTitle
		resData["slug"] = TestSlug
		resData["featured_medium_id"] = nil
		e.PUT(path).
			WithPath("page_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)

		resData["featured_medium_id"] = TestFeaturedMediumID
		Data["featured_medium_id"] = TestFeaturedMediumID
	})
}
