package post

import (
	"database/sql/driver"
	"fmt"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/format"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/tag"
	"github.com/factly/dega-server/test/service/fact-check/claim"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"title":    "Post",
	"subtitle": "post subtitle",
	"slug":     "post",
	"status":   "draft",
	"page":     true,
	"excerpt":  "post excerpt",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description":   "<p>Test Description</p>",
	"is_featured":        false,
	"is_sticky":          true,
	"is_highlighted":     true,
	"featured_medium_id": uint(1),
	"published_date":     time.Now(),
	"format_id":          uint(1),
	"category_ids":       []uint{1},
	"tag_ids":            []uint{1},
	"claim_ids":          []uint{1},
	"author_ids":         []uint{1},
}
var postData = map[string]interface{}{
	"title":    "Post",
	"subtitle": "post subtitle",
	"slug":     "post",
	"status":   "draft",
	"page":     true,
	"excerpt":  "post excerpt",
	"description": postgres.Jsonb{
		RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description"}}],"version":"2.19.0"}`),
	},
	"html_description": "<p>Test Description</p>",
	"is_featured":      false,
	"is_sticky":        true,
	"is_highlighted":   true,
	"format_id":        uint(1),
}

var postList = []map[string]interface{}{
	{
		"title":    "Post 1",
		"subtitle": "post subtitle 1",
		"slug":     "post-1",
		"status":   "draft",
		"page":     true,
		"excerpt":  "post excerpt",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description 1"}}],"version":"2.19.0"}`),
		},
		"html_description":   "<p>Test Description 1</p>",
		"is_featured":        false,
		"is_sticky":          true,
		"is_highlighted":     true,
		"featured_medium_id": uint(1),
		"format_id":          uint(1),
	},
	{
		"title":    "Post 2",
		"subtitle": "post subtitle",
		"slug":     "post-2",
		"status":   "draft",
		"page":     true,
		"excerpt":  "post excerpt",
		"description": postgres.Jsonb{
			RawMessage: []byte(`{"time":1617039625490,"blocks":[{"type":"paragraph","data":{"text":"Test Description 2"}}],"version":"2.19.0"}`),
		},
		"html_description":   "<p>Test Description 2</p>",
		"is_featured":        false,
		"is_sticky":          true,
		"is_highlighted":     true,
		"featured_medium_id": uint(1),
		"format_id":          uint(1),
	},
}

var invalidData = map[string]interface{}{
	"title": "a",
}

var publishData = map[string]interface{}{
	"published_date": time.Now(),
}

var templateData = map[string]interface{}{
	"post_id": 1,
}

var invalidTemplateData = map[string]interface{}{
	"posd": 1,
}

var undecodableTemplateData = map[string]interface{}{
	"post_id": "dfdsf",
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "title", "subtitle", "slug", "status", "page", "excerpt", "description", "html_description", "is_featured", "is_sticky", "is_highlighted", "featured_medium_id", "format_id", "published_date", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "posts"`)
var paginationQuery = `SELECT \* FROM "posts" (.+) LIMIT 1 OFFSET 1`

var basePath = "/core/posts"
var path = "/core/posts/{post_id}"
var publishBasePath = "/core/posts/publish"
var publishPath = "/core/posts/{post_id}/publish"
var templatePath = "/core/posts/templates"

func slugCheckMock(mock sqlmock.Sqlmock, post map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "posts"`)).
		WithArgs(fmt.Sprint(post["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func postInsertMock(mock sqlmock.Sqlmock, post map[string]interface{}, isPublished bool) {
	mock.ExpectBegin()

	medium.SelectWithSpace(mock)
	format.SelectMock(mock, 1, 1)

	if isPublished {
		mock.ExpectQuery(`INSERT INTO "posts"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, post["title"], post["subtitle"], post["slug"], post["status"], post["page"], post["excerpt"], post["description"], post["html_description"], post["is_featured"], post["is_sticky"], post["is_highlighted"], post["format_id"], test.AnyTime{}, 1, post["featured_medium_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"featured_medium_id", "id"}).
				AddRow(1, 1))
	} else {
		mock.ExpectQuery(`INSERT INTO "posts"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, post["title"], post["subtitle"], post["slug"], post["status"], post["page"], post["excerpt"], post["description"], post["html_description"], post["is_featured"], post["is_sticky"], post["is_highlighted"], post["format_id"], nil, 1, post["featured_medium_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"featured_medium_id", "id"}).
				AddRow(1, 1))
	}

	mock.ExpectQuery(`INSERT INTO "tags"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, tag.Data["name"], tag.Data["slug"], tag.Data["description"], tag.Data["html_description"], tag.Data["is_featured"], 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))

	mock.ExpectExec(`INSERT INTO "post_tags"`).
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	medium.SelectWithSpace(mock)

	mock.ExpectQuery(`INSERT INTO "categories"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["is_featured"], sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.
			NewRows([]string{"id", "parent_id", "medium_id"}).
			AddRow(1, 1, 1))

	mock.ExpectExec(`INSERT INTO "post_categories"`).
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))
}

func postListMock(mock sqlmock.Sqlmock) {
	test.CheckSpaceMock(mock)
	postCountQuery(mock, len(postList))

	mock.ExpectQuery(selectQuery).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, postList[0]["title"], postList[0]["subtitle"], postList[0]["slug"], postList[0]["status"], postList[0]["page"], postList[0]["excerpt"],
				postList[0]["description"], postList[0]["html_description"], postList[0]["is_featured"], postList[0]["is_sticky"], postList[0]["is_highlighted"], postList[0]["featured_medium_id"], postList[0]["format_id"], postList[0]["published_date"], 1).
			AddRow(2, time.Now(), time.Now(), nil, 1, 1, postList[1]["title"], postList[1]["subtitle"], postList[1]["slug"], postList[1]["status"], postList[1]["page"], postList[1]["excerpt"],
				postList[1]["description"], postList[1]["html_description"], postList[1]["is_featured"], postList[1]["is_sticky"], postList[1]["is_highlighted"], postList[1]["featured_medium_id"], postList[1]["format_id"], postList[1]["published_date"], 1))

	preloadMock(mock, sqlmock.AnyArg(), sqlmock.AnyArg())

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1))

	claim.SelectWithOutSpace(mock, claim.Data)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1))

}

func postListWithFiltersMock(mock sqlmock.Sqlmock) {
	test.CheckSpaceMock(mock)
	postCountQuery(mock, len(postList))

	mock.ExpectQuery(selectQuery).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, postList[0]["title"], postList[0]["subtitle"], postList[0]["slug"], postList[0]["status"], postList[0]["page"], postList[0]["excerpt"],
				postList[0]["description"], postList[0]["html_description"], postList[0]["is_featured"], postList[0]["is_sticky"], postList[0]["is_highlighted"], postList[0]["featured_medium_id"], postList[0]["format_id"], postList[0]["published_date"], 1).
			AddRow(2, time.Now(), time.Now(), nil, 1, 1, postList[1]["title"], postList[1]["subtitle"], postList[1]["slug"], postList[1]["status"], postList[1]["page"], postList[1]["excerpt"],
				postList[1]["description"], postList[1]["html_description"], postList[1]["is_featured"], postList[1]["is_sticky"], postList[1]["is_highlighted"], postList[1]["featured_medium_id"], postList[1]["format_id"], postList[1]["published_date"], 1))

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_categories"`)).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"post_id", "category_id"}).
			AddRow(1, 1))
	category.SelectWithOutSpace(mock)

	format.SelectMock(mock, 1)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_tags"`)).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"post_id", "tag_id"}).
			AddRow(1, 1))
	tag.SelectMock(mock, tag.Data, 1)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1))

	claim.SelectWithOutSpace(mock, claim.Data)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "author_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, 1, 1))

}

func preloadMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_categories"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows([]string{"post_id", "category_id"}).
			AddRow(1, 1))
	category.SelectWithOutSpace(mock)

	format.SelectMock(mock, 1)
	medium.SelectWithOutSpace(mock)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_tags"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows([]string{"post_id", "tag_id"}).
			AddRow(1, 1))
	tag.SelectMock(mock, tag.Data, 1)
}

func postSelectWithOutSpace(mock sqlmock.Sqlmock, post map[string]interface{}) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, post["title"], post["subtitle"], post["slug"], post["status"], post["page"], post["excerpt"],
				post["description"], post["html_description"], post["is_featured"], post["is_sticky"], post["is_highlighted"], post["featured_medium_id"], post["format_id"], post["published_date"], 1))

	// Preload Claimant & Rating
	preloadMock(mock, 1)
}

func postSelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["title"], Data["subtitle"], Data["slug"], Data["status"], Data["page"], Data["excerpt"],
				Data["description"], Data["html_description"], Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], Data["featured_medium_id"], Data["format_id"], Data["published_date"], 1))
}

func postSelectPublishedWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["title"], Data["subtitle"], Data["slug"], "publish", Data["page"], Data["excerpt"],
				Data["description"], Data["html_description"], Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], Data["featured_medium_id"], Data["format_id"], Data["published_date"], 1))
}

//check post exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 100).
		WillReturnRows(sqlmock.NewRows(columns))
}

func postCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "posts"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func postClaimInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(`INSERT INTO "post_claims"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

func postClaimSelectMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1))

	claim.SelectWithOutSpace(mock, claim.Data)
}

func postAuthorSelectMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1))

}

func postAuthorInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(`INSERT INTO "post_authors"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

func preUpdateMock(mock sqlmock.Sqlmock, post map[string]interface{}, slugCheckRequired bool) {
	// slug check is required
	if slugCheckRequired {
		slugCheckMock(mock, post)
	}

	mock.ExpectBegin()
	// get new tags & categories to update
	tag.SelectMock(mock, tag.Data, 1)

	medium.SelectWithSpace(mock)
	format.SelectMock(mock, 1, 1)

	mock.ExpectExec(`UPDATE "posts" SET`).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(driver.ResultNoRows)

	mock.ExpectQuery(`INSERT INTO "tags"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, tag.Data["name"], tag.Data["slug"], tag.Data["description"], tag.Data["html_description"], tag.Data["is_featured"], 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))

	mock.ExpectExec(`INSERT INTO "post_tags"`).
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	category.SelectWithOutSpace(mock)

	medium.SelectWithSpace(mock)
	format.SelectMock(mock, 1, 1)
	mock.ExpectExec(`UPDATE "posts" SET`).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(driver.ResultNoRows)

	medium.SelectWithSpace(mock)
	mock.ExpectQuery(`INSERT INTO "categories"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["is_featured"], sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.
			NewRows([]string{"id", "parent_id", "medium_id"}).
			AddRow(1, 1, 1))

	mock.ExpectExec(`INSERT INTO "post_categories"`).
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_categories"`)).
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))
}

func preUpdateDraftMock(mock sqlmock.Sqlmock, post map[string]interface{}, slugCheckRequired bool) {
	postSelectWithSpace(mock)
	preUpdateMock(mock, post, slugCheckRequired)
	medium.SelectWithSpace(mock)
	format.SelectMock(mock, 1, 1)
}

func preUpdatePublishedMock(mock sqlmock.Sqlmock, post map[string]interface{}, slugCheckRequired bool) {
	postSelectPublishedWithSpace(mock)
	preUpdateMock(mock, post, slugCheckRequired)

	// Check medium & format belong to same space or not
	medium.SelectWithSpace(mock)
	format.SelectMock(mock, 1, 1)
}

func updateQueryMock(mock sqlmock.Sqlmock, post map[string]interface{}, slugCheckRequired bool) {
	mock.ExpectExec(`UPDATE \"posts\"`).
		WithArgs(test.AnyTime{}, post["page"], post["is_featured"], post["is_sticky"], post["is_highlighted"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	medium.SelectWithSpace(mock)
	format.SelectMock(mock, 1, 1)
	mock.ExpectExec(`UPDATE \"posts\"`).
		WithArgs(test.AnyTime{}, 1, post["title"], post["subtitle"], post["slug"], post["excerpt"],
			post["description"], post["html_description"], post["is_sticky"], post["is_highlighted"], post["featured_medium_id"], post["format_id"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	postUpdateQueryMock(mock, post)
}

func updatePublishedQueryMock(mock sqlmock.Sqlmock, post map[string]interface{}, slugCheckRequired bool) {
	mock.ExpectExec(`UPDATE \"posts\"`).
		WithArgs(test.AnyTime{}, nil, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	medium.SelectWithSpace(mock)
	format.SelectMock(mock, 1, 1)
	mock.ExpectExec(`UPDATE \"posts\"`).
		WithArgs(test.AnyTime{}, post["page"], post["is_featured"], post["is_sticky"], post["is_highlighted"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	medium.SelectWithSpace(mock)
	format.SelectMock(mock, 1, 1)
	mock.ExpectExec(`UPDATE \"posts\"`).
		WithArgs(test.AnyTime{}, 1, post["title"], post["subtitle"], post["slug"], post["status"], post["excerpt"],
			post["description"], post["html_description"], post["is_sticky"], post["is_highlighted"], post["featured_medium_id"], post["format_id"], 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	postUpdateQueryMock(mock, post)
}

func postUpdateQueryMock(mock sqlmock.Sqlmock, post map[string]interface{}) {
	mock.ExpectQuery(`INSERT INTO "tags"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, tag.Data["name"], tag.Data["slug"], tag.Data["description"], tag.Data["html_description"], tag.Data["is_featured"], 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))

	mock.ExpectExec(`INSERT INTO "post_tags"`).
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	medium.SelectWithSpace(mock)

	mock.ExpectQuery(`INSERT INTO "categories"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, category.Data["name"], category.Data["slug"], category.Data["description"], category.Data["html_description"], category.Data["is_featured"], sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.
			NewRows([]string{"id", "parent_id", "medium_id"}).
			AddRow(1, 1, 1))

	mock.ExpectExec(`INSERT INTO "post_categories"`).
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, post["title"], post["subtitle"], post["slug"], post["status"], post["page"], post["excerpt"], post["description"], post["html_description"], post["is_featured"], post["is_sticky"], post["is_highlighted"], post["featured_medium_id"], post["format_id"], post["published_date"], 1))

	preloadMock(mock)
}

func updatePostClaimsMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 2, 1))

	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_claims" SET "deleted_at"=`)).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectQuery(`INSERT INTO "post_claims"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1))
	claim.SelectWithOutSpace(mock, claim.Data)

}

func updatePostAuthorMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "author_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, 2, 1))

	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_authors" SET "deleted_at"=`)).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectQuery(`INSERT INTO "post_authors"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))

	postAuthorSelectMock(mock)
}

func updateMock(mock sqlmock.Sqlmock, post map[string]interface{}, slugCheckRequired bool) {
	preUpdateDraftMock(mock, post, slugCheckRequired)
	updateQueryMock(mock, post, slugCheckRequired)
	updatePostClaimsMock(mock)
	updatePostAuthorMock(mock)
}

func deleteMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
		WillReturnResult(sqlmock.NewResult(0, 1))

	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_categories"`)).
		WillReturnResult(sqlmock.NewResult(0, 1))

	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_authors" SET "deleted_at"=`)).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_claims" SET "deleted_at"=`)).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "posts" SET "deleted_at"=`)).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
}

func prePublishMock(mock sqlmock.Sqlmock) {
	test.CheckSpaceMock(mock)
	postSelectWithSpace(mock)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "post_authors"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

	mock.ExpectBegin()
}

func publishMock(mock sqlmock.Sqlmock) {

	medium.SelectWithSpace(mock)
	format.SelectMock(mock, 1, 1)

	mock.ExpectExec(`UPDATE \"posts\"`).
		WithArgs(test.AnyTime{}, 1, "publish", test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["title"], Data["subtitle"], Data["slug"], Data["status"], Data["page"], Data["excerpt"], Data["description"], Data["html_description"], Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], Data["featured_medium_id"], Data["format_id"], Data["published_date"], 1))

	preloadMock(mock)
	postClaimSelectMock(mock)
	postAuthorSelectMock(mock)

}
