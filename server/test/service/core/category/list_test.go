package category

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/gavv/httpexpect"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestCategoryList(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get empty list of categories", func(t *testing.T) {

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})

		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of categories", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(len(categorylist)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, categorylist[0].Name, categorylist[0].Slug, TestDescriptionJson, TestDescriptionHtml, categorylist[0].BackgroundColour, categorylist[0].ParentID, categorylist[0].MetaFields, categorylist[0].MediumID, categorylist[0].IsFeatured, 1, categorylist[0].Meta, categorylist[0].HeaderCode, categorylist[0].FooterCode).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, categorylist[1].Name, categorylist[1].Slug, TestDescriptionJson, TestDescriptionHtml, categorylist[0].BackgroundColour, categorylist[1].ParentID, categorylist[1].MetaFields, categorylist[1].MediumID, categorylist[1].IsFeatured, 1, categorylist[1].Meta, categorylist[1].HeaderCode, categorylist[1].FooterCode))

		medium.SelectWithOutSpace(mock)

		// delete(categorylist[0], "parent_id")
		// delete(categorylist[0], "medium_id")

		categorylist[0].ParentID = nil
		categorylist[0].MediumID = nil

		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(categorylist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(newResData)

		test.ExpectationsMet(t, mock)

	})

	t.Run("get list of categories with paiganation", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(len(categorylist)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, categorylist[1].Name, categorylist[1].Slug, TestDescriptionJson, TestDescriptionHtml, categorylist[1].BackgroundColour, categorylist[1].ParentID, categorylist[1].MetaFields, categorylist[1].MediumID, categorylist[1].IsFeatured, 1, categorylist[1].Meta, categorylist[1].HeaderCode, categorylist[1].FooterCode))

		medium.SelectWithOutSpace(mock)

		// delete(categorylist[1], "parent_id")
		// delete(categorylist[1], "medium_id")
		categorylist[1].ParentID = &TestParentID
		var TestMediumId uint = 0
		categorylist[1].MediumID = &TestMediumId
		newResData["name"] = "Test Name 2"
		newResData["slug"] = "testname2"
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
			ContainsMap(map[string]interface{}{"total": len(categorylist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(newResData)
		newResData["name"] = TestName
		newResData["slug"] = TestSlug

		test.ExpectationsMet(t, mock)

	})

	t.Run("get list of categories based on search query q", func(t *testing.T) {
		// test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(len(categorylist)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, categorylist[0].Name, categorylist[0].Slug, TestDescriptionJson, TestDescriptionHtml, categorylist[0].BackgroundColour, 0, categorylist[0].MetaFields, 1, categorylist[0].IsFeatured, 1, categorylist[0].Meta, categorylist[0].HeaderCode, categorylist[0].FooterCode).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, categorylist[1].Name, categorylist[1].Slug, TestDescriptionJson, TestDescriptionHtml, categorylist[1].BackgroundColour, 0, categorylist[1].MetaFields, 1, categorylist[1].IsFeatured, 1, categorylist[1].Meta, categorylist[1].HeaderCode, categorylist[1].FooterCode))

		medium.SelectWithOutSpace(mock)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"q":    "test",
				"sort": "asc",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(categorylist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(categorylist[0])

		test.ExpectationsMet(t, mock)

	})

	t.Run("when query does not match any category", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		test.DisableMeiliGock(testServer.URL)

		gock.New(viper.GetString("meili_url") + "/indexes/dega/search").
			HeaderPresent("X-Meili-API-Key").
			Persist().
			Reply(http.StatusOK).
			JSON(test.EmptyMeili)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"q":    "test",
				"sort": "asc",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("total").
			Equal(0)

		test.ExpectationsMet(t, mock)
	})

	t.Run("search with query q when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		test.CheckSpaceMock(mock)

		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"q":    "test",
				"sort": "asc",
			}).
			Expect().
			Status(http.StatusServiceUnavailable)
		test.ExpectationsMet(t, mock)

	})

}
