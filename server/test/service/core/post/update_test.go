package post

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestPostUpdate(t *testing.T) {
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

	t.Run("invalid post id", func(t *testing.T) {
		e.PUT(path).
			WithPath("post_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("post record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("post_id", 10000000).
			WithHeaders(headers).
			WithJSON(resData).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("unprocessabel post", func(t *testing.T) {
		e.PUT(path).
			WithPath("post_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(invaidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("update post", func(t *testing.T) {

		resData["title"] = "Update Title"
		resData["slug"] = "update-title"
		Data["title"] = "Update Title"
		Data["slug"] = "update-title"
		e.PUT(path).
			WithPath("post_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)

	})

	t.Run("cannot parse post description", func(t *testing.T) {
		e.PUT(path).
			WithPath("post_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(map[string]interface{}{
				"description": "invalid",
			}).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("update post with different slug", func(t *testing.T) {
		Data["title"] = "Update Title"
		Data["slug"] = "update-title"
		resData["title"] = "Update Title"
		resData["slug"] = "update-title"
		e.PUT(path).
			WithPath("post_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)
	})
	t.Run("update post with empty slug", func(t *testing.T) {
		Data["title"] = "Update Title"
		Data["slug"] = ""
		resData["title"] = "Update Title"
		resData["slug"] = "update-title-1"
		e.PUT(path).
			WithPath("post_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)
	})

	t.Run("update post status back to draft", func(t *testing.T) {
		Data["title"] = "Update Title"
		Data["slug"] = "post"
		Data["status"] = "draft"
		resData["slug"] = "post"
		resData["title"] = "Update Title"
		resData["status"] = "draft"
		e.PUT(path).
			WithPath("post_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)
	})
}
