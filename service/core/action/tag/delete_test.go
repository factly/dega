package tag

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/policy"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/test"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
	"gopkg.in/h2non/gock.v1"
)

func TestDelete(t *testing.T) {
	user := os.Getenv("USER_ID")
	errorMsg := "handler returned wrong status code: got %v want %v"
	// Create new space and tag
	space, tag := SetUp()
	config.DB.Create(&tag)

	// Get Tag ID
	tagID := strconv.Itoa(int(tag.ID))

	// Headers
	headers := map[string]string{
		"space": fmt.Sprint(space.ID),
		"user":  user,
	}

	// Create router
	r := chi.NewRouter()
	link := "/core/tags/"
	r.Use(loggerx.Init())
	r.With(util.CheckUser, util.CheckSpace, util.GenerateOrganisation, policy.Authorizer).Group(func(r chi.Router) {
		r.Delete(link+"{tag_id}", delete)
	})

	// Create test server and allow Gock to call the test server.
	ts := httptest.NewServer(r)
	gock.New(ts.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer ts.Close()

	// Contruct url to delete
	url := fmt.Sprint(link + tagID)

	// Successful delete
	t.Run("Delete successful", func(t *testing.T) {
		_, _, status := test.Request(t, ts, "DELETE", url, nil, headers)

		if status != http.StatusOK {
			t.Errorf(errorMsg, status, http.StatusOK)
		}
	})

	// Run tests
	t.Run("User Missing", func(t *testing.T) {
		headers := map[string]string{
			"space": "0",
			"user":  "",
		}
		_, _, status := test.Request(t, ts, "DELETE", url, nil, headers)

		if status != http.StatusUnauthorized {
			t.Errorf(errorMsg, status, http.StatusUnauthorized)
		}
	})

	// Invalid Tags
	t.Run("Invalid Tag", func(t *testing.T) {

		tag := fmt.Sprint(int(tag.ID) * 2379)
		url := fmt.Sprint(link + tag)

		_, _, status := test.Request(t, ts, "DELETE", url, nil, headers)

		if status != http.StatusNotFound {
			t.Errorf(errorMsg, status, http.StatusNotFound)
		}
	})

	// Invalid Tag type
	t.Run("Invalid Tag Type", func(t *testing.T) {

		url := fmt.Sprint(link + "abc")

		_, _, status := test.Request(t, ts, "DELETE", url, nil, headers)

		if status != http.StatusNotFound {
			t.Errorf(errorMsg, status, http.StatusNotFound)
		}
	})

	// Cleanup
	// Delete space and tags
	TearDown()
}
