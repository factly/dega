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

func TestPostCreate(t *testing.T) {

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

	if err := config.DB.Create(&insertData).Error; err != nil {
		log.Fatal(err)
	}
	Data["author_ids"] = []int{int(insertArthorData.ID)}
	Data["format_id"] = insertFormatData.ID
	resData["format_id"] = insertFormatData.ID
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable Entity", func(t *testing.T) {
		e.POST(basePath).
			WithJSON(invaidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("unable to decode post", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
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

	t.Run("cannot parse post description", func(t *testing.T) {
		Data["description"] = "invalid"

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("create post when permission not found", func(t *testing.T) {
		config.DB.Exec("DELETE FROM space_permissions")
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("create more than permitted posts", func(t *testing.T) {
		config.DB.Exec("DELETE FROM space_permissions")

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create post with slug is empty", func(t *testing.T) {
		config.DB.Exec("DELETE FROM space_permissions")

		Data["title"] = "Create post with slug is empty"
		Data["slug"] = ""
		Data["description"] = TestDescriptionFromRequest
		resData["title"] = "Create post with slug is empty"
		resData["slug"] = "create-post-with-slug-is-empty"
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
