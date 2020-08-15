package tag

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/policy"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/test"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
	"gopkg.in/h2non/gock.v1"
)

func TestUpdate(t *testing.T) {
	user := os.Getenv("USER_ID")

	// Create new space and tag
	space, tag := SetUp()
	config.DB.Create(&tag)

	UpdateTag := &model.Tag{
		Name: "test updated",
		Slug: "test-updated",
	}
	reqBody, _ := json.Marshal(UpdateTag)
	req := bytes.NewReader(reqBody)

	// Get Tag ID
	tagID := strconv.Itoa(int(tag.ID))

	// Headers
	headers := map[string]string{
		"space": fmt.Sprint(space.ID),
		"user":  user,
	}

	// Create router
	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.With(util.CheckUser, util.CheckSpace, util.GenerateOrganisation, policy.Authorizer).Group(func(r chi.Router) {
		r.Put("/core/tags/{tag_id}", update)
	})

	// Create test server and allow Gock to call the test server.
	ts := httptest.NewServer(r)
	gock.New(ts.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer ts.Close()

	url := fmt.Sprint("/core/tags/" + tagID)

	// Successful post
	t.Run("Update Tag Successful", func(t *testing.T) {
		_, _, status := test.Request(t, ts, "PUT", url, req, headers)

		if status != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
		}
	})

	// Run tests
	t.Run("User Missing", func(t *testing.T) {
		headers := map[string]string{
			"space": "0",
			"user":  "",
		}
		_, _, status := test.Request(t, ts, "PUT", url, req, headers)

		if status != http.StatusUnauthorized {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusUnauthorized)
		}
	})

	// Invalid Tags
	t.Run("Invalid Tag", func(t *testing.T) {

		tag := fmt.Sprint(int(tag.ID) * 2379)
		url := fmt.Sprint("/core/tags/" + tag)

		_, _, status := test.Request(t, ts, "PUT", url, req, headers)

		if status != http.StatusInternalServerError {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusInternalServerError)
		}
	})

	// Invalid Slug
	t.Run("Invalid Tag", func(t *testing.T) {

		UpdateTag := &model.Tag{
			Name: "test updated",
			Slug: "test updated wrong",
		}
		reqBody, _ := json.Marshal(UpdateTag)
		req := bytes.NewReader(reqBody)

		_, _, status := test.Request(t, ts, "PUT", url, req, headers)

		if status != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
		}
	})

	// Invalid Tag type
	t.Run("Invalid Tag Type", func(t *testing.T) {

		url := fmt.Sprint("/core/tags/" + "abc")

		_, _, status := test.Request(t, ts, "PUT", url, req, headers)

		if status != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusNotFound)
		}
	})

	// Cleanup
	// Delete space and tags
	TearDown()
}
