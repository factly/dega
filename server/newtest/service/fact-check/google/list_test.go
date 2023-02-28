package google

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/newtest"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/model"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestGoogleList(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	newtest.GoogleFactCheckGock()
	//delete all entries from the db and insert some data
	insertData := model.SpacePermission{
		SpaceID:   1,
		FactCheck: true,
		Media:     100,
		Posts:     100,
		Podcast:   true,
		Episodes:  100,
		Videos:    100,
	}
	if err := config.DB.Model(&model.SpacePermission{}).Create(&insertData).Error; err != nil {
		t.Error(err)
	}
	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	headers := map[string]string{
		"X-User":  "1",
		"X-Space": "1",
	}
	path := "/fact-check/google"

	t.Run("get list of google factchecks", func(t *testing.T) {

		e.GET(path).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"query":    "modi",
				"language": "en",
			}).
			Expect().
			Status(http.StatusOK)
	})

	t.Run("get google factcheck without query", func(t *testing.T) {

		e.GET(path).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"language": "en",
			}).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("get list of google factchecks with pageToken query param", func(t *testing.T) {

		e.GET(path).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"query":     "modi",
				"language":  "en",
				"pageToken": "abc",
			}).
			Expect().
			Status(http.StatusOK)
	})

}
