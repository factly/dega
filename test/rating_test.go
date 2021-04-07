package test

import (
	"database/sql/driver"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var ratingData = map[string]interface{}{
	"name": "True",
	"slug": "true",
	"background_colour": postgres.Jsonb{
		RawMessage: []byte(`"green"`),
	},
	"text_colour": postgres.Jsonb{
		RawMessage: []byte(`"green"`),
	},
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description": "<p>Test Description</p>",
	"numeric_value":    5,
	"medium_id":        uint(1),
}

var ratingColumns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "background_colour", "text_colour", "medium_id", "description", "html_description", "numeric_value", "space_id"}

func TestRatings(t *testing.T) {
	// Setup Mock DB
	mock := SetupMockDB()

	// Start test server
	testServer := httptest.NewServer(TestRouter())
	defer testServer.Close()

	// Setup httpexpect
	e := httpexpect.New(t, testServer.URL)

	// ratings testcases
	t.Run("get list of ratings", func(t *testing.T) {
		RatingCountMock(mock, 1)
		RatingSelectMock(mock)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

		resp := e.POST(path).
			WithJSON(Query{
				Query: `{
					ratings {
						nodes {
							id
							space_id
							description
							html_description	
							background_colour
							text_colour
							medium {
								id
							}
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1", "space_id": 1, "description": ratingData["description"], "html_description": ratingData["html_description"], "background_colour": ratingData["background_colour"], "text_colour": ratingData["text_colour"], "medium": map[string]interface{}{"id": "1"}},
			},
		}, "ratings")
		ExpectationsMet(t, mock)
	})

	t.Run("get rating ids sorted by created_by in ascending order from spaces given as paramter", func(t *testing.T) {

		RatingCountMock(mock, 1)
		mock.ExpectQuery(`SELECT \* FROM "ratings" (.+) ORDER BY created_at asc`).
			WithArgs(5, 6).
			WillReturnRows(sqlmock.NewRows(ratingColumns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, ratingData["name"], ratingData["slug"], ratingData["background_colour"], ratingData["text_colour"], ratingData["medium_id"], ratingData["description"], ratingData["html_description"], ratingData["numeric_value"], 1))

		resp := e.POST(path).
			WithJSON(Query{
				Query: `{
					ratings(sortBy:"created_at", sortOrder:"asc", spaces:[5,6]) {
						nodes {
							id
						}
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"nodes": []map[string]interface{}{
				{"id": "1"},
			},
		}, "ratings")
		ExpectationsMet(t, mock)
	})

}

func RatingSelectMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "ratings"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(ratingColumns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, ratingData["name"], ratingData["slug"], ratingData["background_colour"], ratingData["text_colour"], ratingData["medium_id"], ratingData["description"], ratingData["html_description"], ratingData["numeric_value"], 1))
}

func RatingCountMock(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "ratings"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}
