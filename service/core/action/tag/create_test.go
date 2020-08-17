package tag

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/factly/dega-server/service/core/action/policy"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/test"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
	"gopkg.in/h2non/gock.v1"
)

func TestCreate(t *testing.T) {

	user := os.Getenv("USER_ID")
	errorMsg := "handler returned wrong status code: got %v want %v"
	// Create space and tag
	space, tag := SetUp()

	reqBody, _ := json.Marshal(tag)
	req := bytes.NewReader(reqBody)

	// Headers
	headers := map[string]string{
		"space": fmt.Sprint(space.ID),
		"user":  user,
	}

	// Create router
	r := chi.NewRouter()
	link := "/core/tags"
	r.Use(loggerx.Init())
	r.With(util.CheckUser, util.CheckSpace, util.GenerateOrganisation, policy.Authorizer).Group(func(r chi.Router) {
		r.Post(link, create)
	})

	// Create test server and allow Gock to call the test server.
	ts := httptest.NewServer(r)
	gock.New(ts.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer ts.Close()

	// Successful post
	t.Run("Create Tag Successful", func(t *testing.T) {
		_, _, status := test.Request(t, ts, "POST", link, req, headers)

		if status != http.StatusCreated {
			t.Errorf(errorMsg, status, http.StatusCreated)
		}
	})

	// Missing user in the header
	t.Run("User Missing", func(t *testing.T) {
		headers := map[string]string{
			"space": "0",
			"user":  "",
		}
		_, _, status := test.Request(t, ts, "POST", link, req, headers)

		if status != http.StatusUnauthorized {
			t.Errorf(errorMsg, status, http.StatusUnauthorized)
		}
	})

	//  Invalid Slug in the tag
	t.Run("Invalid Slug", func(t *testing.T) {

		createTag := &model.Tag{
			SpaceID: space.ID,
			Name:    "tag tag",
			Slug:    "tag tag",
		}
		reqBody, _ := json.Marshal(createTag)
		req := bytes.NewReader(reqBody)

		_, _, status := test.Request(t, ts, "POST", link, req, headers)

		if status != http.StatusCreated {
			t.Errorf(errorMsg, status, http.StatusCreated)
		}
	})

	// Invalid tag type
	t.Run("Invalid Tag Type", func(t *testing.T) {

		createTag := &model.Tag{}
		reqBody, _ := json.Marshal(createTag)
		req := bytes.NewReader(reqBody)

		_, _, status := test.Request(t, ts, "POST", link, req, headers)

		if status != http.StatusUnprocessableEntity {
			t.Errorf(errorMsg, status, http.StatusUnprocessableEntity)
		}
	})

	// Cleanup
	// Delete space and tags
	TearDown()
}
