package rating

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/factly/dega-server/test/service/core/spacePermission"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestRatingList(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	ratinglist := []map[string]interface{}{
		{"name": "Test Rating 1", "slug": "test-rating-1"},
		{"name": "Test Rating 2", "slug": "test-rating-2"},
	}

	t.Run("get empty list of ratings", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		ratingCountQuery(mock, 0)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})

		test.ExpectationsMet(t, mock)
	})

	t.Run("get non-empty list of ratings", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		ratingCountQuery(mock, len(ratinglist))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, ratinglist[0]["name"], ratinglist[0]["slug"], ratinglist[0]["medium_id"], ratinglist[0]["description"], ratinglist[0]["numeric_value"], 1).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, ratinglist[1]["name"], ratinglist[1]["slug"], ratinglist[1]["medium_id"], ratinglist[1]["description"], ratinglist[1]["numeric_value"], 1))

		e.GET(basePath).
			WithHeaders(headers).
			WithQuery("all", "true").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(ratinglist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(ratinglist[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get ratings with pagination", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		spacePermission.SelectQuery(mock, 1)
		ratingCountQuery(mock, len(ratinglist))

		mock.ExpectQuery(paginationQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, ratinglist[1]["name"], ratinglist[1]["slug"], ratinglist[1]["medium_id"], ratinglist[1]["description"], ratinglist[1]["numeric_value"], 1))

		e.GET(basePath).
			WithQueryObject(map[string]interface{}{
				"limit": "1",
				"page":  "2",
			}).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(ratinglist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(ratinglist[1])

		test.ExpectationsMet(t, mock)

	})
}
