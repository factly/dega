package format

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/core/action/format"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestDefaultFormatCreate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all the entries from the db and then insert some data
	config.DB.Exec("DELETE FROM media")
	config.DB.Exec("DELETE FROM formats")

	format.DataFile = "../../../../data/formats.json"
	e := httpexpect.New(t, testServer.URL)
	t.Run("create default formats", func(t *testing.T) {
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			Value("nodes").
			Array()
	})

	t.Run("create default formats already created", func(t *testing.T) {
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			Value("nodes").
			Array()
	})

	t.Run("create default formats when data file is not present", func(t *testing.T) {
		format.DataFile = "wrong path"
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("when cannot parse data file", func(t *testing.T) {
		format.DataFile = "./invalidData.json"
		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
	})
}
