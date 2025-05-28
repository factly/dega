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

func TestMediumCreate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM media")
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

	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable medium", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("unable to decode medium ", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("create medium ", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(Data)
	})

	t.Run("create medium when permission is not present", func(t *testing.T) {
		config.DB.Exec("DELETE FROM space_permissions")
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("create more than permitted medium", func(t *testing.T) {
		config.DB.Exec("DELETE FROM space_permissions")

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("create medium with empty slug", func(t *testing.T) {
		config.DB.Exec("DELETE FROM space_permissions")

		createArr[0]["name"] = "Image-2"
		createArr[0]["slug"] = ""

		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			Value("nodes").
			Array().
			Element(0).
			Object()
		createArr[0]["slug"] = "image-2"
		res.ContainsMap(createArr[0])
	})

	t.Run("medium does not belong same space", func(t *testing.T) {
		config.DB.Exec("DELETE FROM space_permissions")

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(createArr).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
}
