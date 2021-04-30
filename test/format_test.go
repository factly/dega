package test

import (
	"database/sql/driver"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

var formatData = map[string]interface{}{
	"name": "Fact Check",
	"slug": "fact-check",
}

var formatColumns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug"}

func TestFormats(t *testing.T) {
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

	// formats testcases
	t.Run("get list of tag ids", func(t *testing.T) {
		CheckSpaceMock(mock)
		FormatCountMock(mock, 1)
		FormatSelectMock(mock)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: ` {
				formats{
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
		}, "formats")
		ExpectationsMet(t, mock)
	})

	t.Run("get list of tag ids with space ids passed as parameter", func(t *testing.T) {
		CheckSpaceMock(mock)
		FormatCountMock(mock, 1)
		FormatSelectMock(mock, 1)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: ` {
				formats{
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
		}, "formats")
		ExpectationsMet(t, mock)
	})
}

func FormatSelectMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "formats"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(formatColumns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, formatData["name"], formatData["slug"]))
}

func FormatCountMock(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "formats"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}
