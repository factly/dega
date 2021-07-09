package test

import (
	"database/sql/driver"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

var spaceData map[string]interface{} = map[string]interface{}{
	"name":            "Test Space",
	"slug":            "test-space",
	"site_title":      "Test site title",
	"tag_line":        "Test tagline",
	"description":     "Test Desc",
	"site_address":    "testaddress.com",
	"logo_id":         1,
	"logo_mobile_id":  1,
	"fav_icon_id":     1,
	"mobile_icon_id":  1,
	"organisation_id": 1,
}

var spaceColumns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "site_title", "tag_line", "description", "site_address", "logo_id", "logo_mobile_id", "fav_icon_id", "mobile_icon_id", "verification_codes", "social_media_urls", "contact_info", "organisation_id"}

func TestSpaces(t *testing.T) {
	// Setup Mock DB
	mock := SetupMockDB()
	KavachMockServer()

	// Start test server
	testServer := httptest.NewServer(TestRouter())
	defer testServer.Close()

	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer gock.Off()

	// Setup httpexpect
	e := httpexpect.New(t, testServer.URL)

	t.Run("get space", func(t *testing.T) {
		CheckSpaceMock(mock)
		SpaceSelectQuery(mock, 1)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).
				AddRow(1))

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					space {
						id
						logo {
							id
						}
						logo_mobile {
							id
						}
						fav_icon {
							id
						}
						mobile_icon {
							id
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"id": "1", "logo": map[string]interface{}{"id": "1"}, "logo_mobile": map[string]interface{}{"id": "1"}, "fav_icon": map[string]interface{}{"id": "1"}, "mobile_icon": map[string]interface{}{"id": "1"},
		}, "space")
		ExpectationsMet(t, mock)
	})

	t.Run("space header not passed", func(t *testing.T) {
		e.POST(path).
			WithJSON(Query{
				Query: `{
					space {
						id
						logo_mobile {
							id
						}
					}
				}`,
			}).Expect().
			Status(http.StatusUnauthorized)
	})

}

func SpaceSelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "spaces"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(spaceColumns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, spaceData["name"], spaceData["slug"], spaceData["site_title"], spaceData["tag_line"], spaceData["description"], spaceData["site_address"], spaceData["logo_id"], spaceData["logo_mobile_id"], spaceData["fav_icon_id"], spaceData["mobile_icon_id"], spaceData["verification_codes"], spaceData["social_media_urls"], spaceData["contact_info"], spaceData["organisation_id"]))
}
