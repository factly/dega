package tag

import (
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

	"github.com/factly/dega-server/config"
)

func TestList(t *testing.T) {
	var tagsList []uint

	user := os.Getenv("USER_ID")

	var temp model.Tag
	var requests []model.Tag

	// Create new space
	space, _ := SetUp()
	spaceID := fmt.Sprint(space.ID)

	for i := 0; i < 10; i++ {
		temp = model.Tag{
			SpaceID: space.ID,
			Name:    fmt.Sprintf("Tag %d", i),
			Slug:    fmt.Sprintf("tag-%d", i),
		}

		config.DB.Create(&temp)

		requests = append(requests, temp)
		tagsList = append(tagsList, temp.ID)
	}

	headers := map[string]string{
		"space": spaceID,
		"user":  user,
	}

	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.With(util.CheckUser, util.CheckSpace, util.GenerateOrganisation, policy.Authorizer).Group(func(r chi.Router) {
		r.Get("/core/tags", list)
	})

	// Create test server and allow Gock to call the test server.
	ts := httptest.NewServer(r)
	gock.New(ts.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer ts.Close()

	// Retrieve list
	t.Run("Get Successful", func(t *testing.T) {

		_, y, status := test.Request(t, ts, "GET", "/core/tags", nil, headers)

		if status != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
		}

		// Data present here , with type assertion
		// total := y["total"].(int)
		data := y["nodes"].([]interface{})

		for index, value := range data {

			// Indexes taken from the end as the requests array is appended, and hence is the reverse of the array received
			indexRequest := len(requests) - index - 1

			// Value of the element with type assertion
			temp := value.(map[string]interface{})

			// compare the data received with the original values
			check := requests[indexRequest].ID == uint(temp["id"].(float64)) && requests[indexRequest].Name == temp["name"].(string) && requests[indexRequest].Slug == temp["slug"].(string)

			if !check {
				t.Error("Improper values and got", fmt.Sprint(check))
			}
		}
	})

	// Missing space and user in header
	t.Run("User Missing", func(t *testing.T) {
		headers := map[string]string{
			"space": "",
			"user":  "",
		}
		_, _, status := test.Request(t, ts, "GET", "/core/tags", nil, headers)

		if status != http.StatusUnauthorized {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusUnauthorized)
		}
	})

	// Invalid Tag type
	t.Run("Invalid Tag Type", func(t *testing.T) {

		url := fmt.Sprint("/core/tags/" + "abc")

		_, _, status := test.Request(t, ts, "GET", url, nil, headers)

		if status != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusNotFound)
		}
	})

	// Cleanup
	// Delete space and tags
	TearDown()

}
