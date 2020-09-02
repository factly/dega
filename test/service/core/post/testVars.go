package post

import (
	"fmt"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/category"
	"github.com/factly/dega-server/test/service/core/medium"
	"github.com/factly/dega-server/test/service/core/tag"
	"github.com/factly/dega-server/test/service/fact-check/claim"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"title":              "Post",
	"subtitle":           "post subtitle",
	"slug":               "post",
	"status":             "published",
	"excerpt":            "post excerpt",
	"description":        test.NilJsonb(),
	"is_featured":        false,
	"is_sticky":          true,
	"is_highlighted":     true,
	"featured_medium_id": uint(1),
	"format_id":          uint(1),
	"published_date":     time.Time{},
	"category_ids":       []uint{1},
	"tag_ids":            []uint{1},
	"claim_ids":          []uint{1},
	"author_ids":         []uint{1},
}
var postData = map[string]interface{}{
	"title":              "Post",
	"subtitle":           "post subtitle",
	"slug":               "post",
	"status":             "published",
	"excerpt":            "post excerpt",
	"description":        test.NilJsonb(),
	"is_featured":        false,
	"is_sticky":          true,
	"is_highlighted":     true,
	"featured_medium_id": uint(1),
	"format_id":          uint(1),
	"published_date":     time.Time{},
}

var dataWithoutSlug = map[string]interface{}{
	"title":              "Post",
	"subtitle":           "post subtitle",
	"slug":               "",
	"status":             "published",
	"excerpt":            "post excerpt",
	"description":        test.NilJsonb(),
	"is_featured":        false,
	"is_sticky":          true,
	"is_highlighted":     true,
	"featured_medium_id": uint(1),
	"format_id":          uint(1),
	"published_date":     time.Time{},
	"category_ids":       []uint{1},
	"tag_ids":            []uint{1},
	"claim_ids":          []uint{1},
	"author_ids":         []uint{1},
}

var invalidData = map[string]interface{}{
	"title": "a",
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "title", "subtitle", "slug", "status", "excerpt",
	"description", "is_featured", "is_sticky", "is_highlighted", "featured_medium_id", "format_id", "published_date", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "posts"`)
var paginationQuery = `SELECT \* FROM "posts" (.+) LIMIT 1 OFFSET 1`

var basePath = "/core/posts"
var path = "/core/posts/{post_id}"

func slugCheckMock(mock sqlmock.Sqlmock, post map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "posts"`)).
		WithArgs(fmt.Sprint(post["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func postInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	medium.SelectWithSpace(mock)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "formats"`)).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}).
			AddRow(1, time.Now(), time.Now(), nil, "Fact check", "factcheck"))
	mock.ExpectQuery(`INSERT INTO "posts"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["title"], Data["subtitle"], Data["slug"], Data["status"], Data["excerpt"],
			Data["description"], Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], Data["featured_medium_id"], Data["format_id"], Data["published_date"], 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
	mock.ExpectExec(`INSERT INTO "post_tags"`).
		WithArgs(1, 1, 1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(`INSERT INTO "post_categories"`).
		WithArgs(1, 1, 1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))
}

func preloadMock(mock sqlmock.Sqlmock) {
	medium.SelectWithOutSpace(mock)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "formats"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}).
			AddRow(1, time.Now(), time.Now(), nil, "Fact check", "factcheck"))

	tag.SelectWithOutSpace(mock, tag.Data)
	category.SelectWithoutSpace(mock)
}

func postSelectWithOutSpace(mock sqlmock.Sqlmock, post map[string]interface{}) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, post["title"], post["subtitle"], post["slug"], post["status"], post["excerpt"],
				post["description"], post["is_featured"], post["is_sticky"], post["is_highlighted"], post["featured_medium_id"], post["format_id"], post["published_date"], 1))

	// Preload Claimant & Rating
	preloadMock(mock)
}

func postSelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["title"], Data["subtitle"], Data["slug"], Data["status"], Data["excerpt"],
				Data["description"], Data["is_featured"], Data["is_sticky"], Data["is_highlighted"], Data["featured_medium_id"], Data["format_id"], Data["published_date"], 1))
}

//check post exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(100, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func postCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "posts"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func postClaimInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(`INSERT INTO "post_claims"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1).
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
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

func updateMock(mock sqlmock.Sqlmock, post map[string]interface{}, slugCheckRequired bool) {

	postSelectWithSpace(mock)

	// preload tags & categories
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM  "tags" INNER JOIN "post_tags"`)).
		WithArgs(sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows(append(tag.Columns, []string{"tag_id", "post_id"}...)).
			AddRow(1, time.Now(), time.Now(), nil, "title1", "slug1", 1, 1, 1))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "categories" INNER JOIN "post_categories"`)).
		WithArgs(sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows(append(category.Columns, []string{"category_id", "post_id"}...)).
			AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "description", 0, 1, 1, 1, 1))

	// get new tags & categories to update
	tag.SelectWithOutSpace(mock, tag.Data)
	category.SelectWithoutSpace(mock)

	// slug check is required
	if slugCheckRequired {
		slugCheckMock(mock, post)
	}

	mock.ExpectBegin()

	// delete old tags & categories associations
	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_tags"`)).
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "post_categories"`)).
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	// Check medium & format belong to same space or not
	medium.SelectWithSpace(mock)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "formats"`)).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}).
			AddRow(1, time.Now(), time.Now(), nil, "Fact check", "factcheck"))

	//update post
	mock.ExpectExec(`UPDATE \"posts\" SET (.+)  WHERE (.+) \"posts\".\"id\" = `).
		WithArgs(post["description"], post["excerpt"], post["featured_medium_id"], post["format_id"],
			post["is_highlighted"], post["is_sticky"], post["slug"], post["status"], post["subtitle"], post["title"],
			test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectExec(`INSERT INTO "post_tags"`).
		WithArgs(1, 1, 1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(`INSERT INTO "post_categories"`).
		WithArgs(1, 1, 1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, post["title"], post["subtitle"], post["slug"], post["status"], post["excerpt"],
				post["description"], post["is_featured"], post["is_sticky"], post["is_highlighted"], post["featured_medium_id"], post["format_id"], post["published_date"], 1))

	// Preload Claimant & Rating
	medium.SelectWithOutSpace(mock)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "formats"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "name", "slug"}).
			AddRow(1, time.Now(), time.Now(), nil, "Fact check", "factcheck"))

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_authors"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "author_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 2, 1))

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 2, 1))

	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_claims" SET "deleted_at"=`)).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectQuery(`INSERT INTO "post_claims"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "post_claims"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "claim_id", "post_id"}).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1))
	claim.SelectWithOutSpace(mock, claim.Data)

	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "post_authors" SET "deleted_at"=`)).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectQuery(`INSERT INTO "post_authors"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))

	postAuthorSelectMock(mock)

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

	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "posts" SET "deleted_at"=`)).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
}
