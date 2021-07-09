package test

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gavv/httpexpect/v2"
	"gopkg.in/h2non/gock.v1"
)

func TestUsers(t *testing.T) {
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

	// users testcases
	t.Run("get list of users", func(t *testing.T) {
		CheckSpaceMock(mock)
		PostSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "author_id"}).AddRow(1, 1).AddRow(1, 2))

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					users {
						nodes {
							id
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
				{"id": "1", "medium": map[string]interface{}{"id": "1"}},
				{"id": "2", "medium": map[string]interface{}{"id": "1"}},
			},
		}, "users")
		ExpectationsMet(t, mock)
	})

	t.Run("get list of users when kavach is down", func(t *testing.T) {
		gock.Off()

		e.POST(path).
			WithJSON(Query{
				Query: `{
					users {
						nodes {
							id
							medium {
								id
							}
						}
					}
				}`,
			}).Expect().
			Status(http.StatusUnauthorized)

		ExpectationsMet(t, mock)
	})

	t.Run("get user by id when kavach is down", func(t *testing.T) {
		SpaceSelectQuery(mock)

		e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					user(id:1) {
						id
					}
				}`,
			}).Expect().
			Status(http.StatusUnauthorized)

		ExpectationsMet(t, mock)
	})

	KavachMockServer()
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer gock.Off()

	t.Run("get user by id", func(t *testing.T) {
		CheckSpaceMock(mock)

		resp := e.POST(path).
			WithHeaders(headers).
			WithJSON(Query{
				Query: `{
					user(id:1) {
						id
					}
				}`,
			}).Expect().
			JSON().
			Object()

		CheckJSON(resp, map[string]interface{}{
			"id": "1",
		}, "user")
		ExpectationsMet(t, mock)
	})

}
