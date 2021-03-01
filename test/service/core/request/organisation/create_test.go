package organisation

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestOrganisationRequestCreate(t *testing.T) {

	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("Unprocessable request body", func(t *testing.T) {
		e.POST(basePath).
			WithJSON(invalidData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("Undecodable request body", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("user not owner of request organisation", func(t *testing.T) {
		test.DisableKavachGock(testServer.URL)

		gock.New(viper.GetString("kavach_url") + "/organisations/my").
			Persist().
			Reply(http.StatusOK).
			JSON([]map[string]interface{}{
				map[string]interface{}{
					"id":         1,
					"created_at": time.Now(),
					"updated_at": time.Now(),
					"deleted_at": nil,
					"title":      "test org",
					"slug":       "test-org",
					"permission": map[string]interface{}{
						"id":              1,
						"created_at":      time.Now(),
						"updated_at":      time.Now(),
						"deleted_at":      nil,
						"user_id":         1,
						"user":            nil,
						"organisation_id": 1,
						"organisation":    nil,
						"role":            "member",
					},
				},
			})

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnauthorized)
		test.ExpectationsMet(t, mock)

	})

	t.Run("create organisation permission request", func(t *testing.T) {
		gock.Off()
		test.MockServer()
		gock.New(testServer.URL).EnableNetworking().Persist()
		defer gock.DisableNetworking()

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "organisation_permission_requests"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 0, 0, Data["title"], Data["description"], "pending", Data["organisation_id"], Data["spaces"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated)
		test.ExpectationsMet(t, mock)
	})

}
