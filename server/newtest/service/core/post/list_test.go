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

func TestPostList(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM media")
	config.DB.Exec("DELETE FROM space_permissions")
	config.DB.Exec("DELETE FROM posts")
	config.DB.Exec("DELETE FROM authors")
	config.DB.Exec("DELETE FROM formats")
	config.DB.Exec("DELETE FROM tags")
	config.DB.Exec("DELETE FROM post_authors")
	var insertAuthorData model.Author
	var insertMediumData model.Medium
	var insertSpacePermission model.SpacePermission
	var insertFormatData model.Format
	var insertPostAuthorData model.PostAuthor
	var insertData model.Post
	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list", func(t *testing.T) {

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})
	})

	t.Run("get non-empty list of media", func(t *testing.T) {
		insertAuthorData = model.Author{
			FirstName: "Arthur",
			LastName:  "Dent",
		}
		config.DB.Create(&insertAuthorData)
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
			AuthorID: insertAuthorData.ID,
			PostID:   insertData.ID,
		}
		if err := config.DB.Model(&model.PostAuthor{}).Create(&insertPostAuthorData).Error; err != nil {
			log.Fatal(err)
		}
		resData["format_id"] = insertFormatData.ID
		resData["title"] = "TestTitle"
		resData["slug"] = "test-title-2"
		delete(resData, "authors")

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 2}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)
	})

	t.Run("get posts with pagination", func(t *testing.T) {
		resData["title"] = "Create Data Test"
		resData["slug"] = "create-data-test"
		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"page":  2,
				"limit": 1,
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 2}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(resData)
	})

	// t.Run("get list of posts based on filters and query", func(t *testing.T) {
	// 	meiliObj := map[string]interface{}{
	// 		"id":             insertData.ID,
	// 		"kind":           "post",
	// 		"title":          insertData.Title,
	// 		"subtitle":       insertData.Subtitle,
	// 		"slug":           insertData.Slug,
	// 		"status":         insertData.Status,
	// 		"excerpt":        insertData.Excerpt,
	// 		"description":    insertData.Description,
	// 		"is_featured":    insertData.IsFeatured,
	// 		"is_sticky":      insertData.IsSticky,
	// 		"is_highlighted": insertData.IsHighlighted,
	// 		"is_page":        insertData.IsPage,
	// 		"format_id":      insertData.FormatID,
	// 		"space_id":       insertData.SpaceID,
	// 		"tag_ids":        []uint{},
	// 		"category_ids":   []uint{},
	// 		"author_ids":     []uint{insertAuthorData.ID},
	// 	}

	// 	if err := meilisearchx.AddDocument(viper.GetString("MEILISEARCH_INDEX"), meiliObj); err != nil {
	// 		log.Fatal(err)
	// 	}
	// 	e.GET(basePath).
	// 		WithHeaders(headers).
	// 		WithQuery("q", "test").
	// 		Expect().
	// 		Status(http.StatusOK).
	// 		JSON().
	// 		Object().
	// 		ContainsMap(map[string]interface{}{"total": 1}).
	// 		Value("nodes").
	// 		Array().
	// 		Element(0).
	// 		Object().
	// 		ContainsMap(map[string]interface{}{
	// 			"title":          insertData.Title,
	// 			"subtitle":       insertData.Subtitle,
	// 			"slug":           insertData.Slug,
	// 			"status":         insertData.Status,
	// 			"excerpt":        insertData.Excerpt,
	// 			"description":    insertData.Description,
	// 			"is_featured":    insertData.IsFeatured,
	// 			"is_sticky":      insertData.IsSticky,
	// 			"is_highlighted": insertData.IsHighlighted,
	// 			"is_page":        insertData.IsPage,
	// 			"format_id":      insertData.FormatID,
	// 			"space_id":       insertData.SpaceID,
	// 		})
	// 	meilisearchx.DeleteDocument(viper.GetString("MEILISEARCH_INDEX"), insertData.ID, "post")
	// })

	// t.Run("query doesnot match any post", func(t *testing.T) {
	// 	e.GET(basePath).
	// 		WithHeaders(headers).
	// 		WithQuery("q", "aaaaaaaaaaa").
	// 		Expect().
	// 		Status(http.StatusOK).
	// 		JSON().
	// 		Object().
	// 		ContainsMap(map[string]interface{}{"total": 0})
	// })
}
