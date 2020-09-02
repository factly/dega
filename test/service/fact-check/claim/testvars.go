package claim

import (
	"fmt"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/fact-check/claimant"
	"github.com/factly/dega-server/test/service/fact-check/rating"
	"github.com/gavv/httpexpect/v2"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"title":           "Claim",
	"slug":            "claim",
	"claim_date":      time.Now(),
	"checked_date":    time.Now(),
	"claim_sources":   "GOI",
	"description":     test.NilJsonb(),
	"claimant_id":     uint(1),
	"rating_id":       uint(1),
	"review":          "Succesfully reviewed",
	"review_tag_line": "tag line",
	"review_sources":  "TOI",
}

var invalidData = map[string]interface{}{
	"title": "a",
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "title", "slug", "claim_date", "checked_date", "claim_sources",
	"description", "claimant_id", "rating_id", "review", "review_tag_line", "review_sources", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "claims"`)
var deleteQuery = regexp.QuoteMeta(`UPDATE "claims" SET "deleted_at"=`)
var paginationQuery = `SELECT \* FROM "claims" (.+) LIMIT 1 OFFSET 1`

var basePath = "/fact-check/claims"
var path = "/fact-check/claims/{claim_id}"

func slugCheckMock(mock sqlmock.Sqlmock, claim map[string]interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT slug, space_id FROM "claims"`)).
		WithArgs(fmt.Sprint(claim["slug"], "%"), 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

func claimInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	claimant.SelectWithSpace(mock)
	rating.SelectWithSpace(mock)
	mock.ExpectQuery(`INSERT INTO "claims"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["title"], Data["slug"], test.AnyTime{}, test.AnyTime{}, Data["claim_sources"], Data["description"], Data["claimant_id"], Data["rating_id"], Data["review"], Data["review_tag_line"], Data["review_sources"], 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
}

func claimantFKError(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	claimant.EmptyRowMock(mock)
	mock.ExpectRollback()
}

func ratingFKError(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	claimant.SelectWithSpace(mock)
	rating.EmptyRowMock(mock)
	mock.ExpectRollback()
}

func claimUpdateMock(mock sqlmock.Sqlmock, claim map[string]interface{}, err error) {
	mock.ExpectBegin()
	claimant.SelectWithSpace(mock)
	rating.SelectWithSpace(mock)
	mock.ExpectExec(`UPDATE \"claims\" SET (.+)  WHERE (.+) \"claims\".\"id\" = `).
		WithArgs(test.AnyTime{}, test.AnyTime{}, claim["claim_sources"], claim["claimant_id"], claim["description"], claim["rating_id"], claim["review"], claim["review_sources"], claim["review_tag_line"], claim["slug"], claim["title"],
			test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
	SelectWithOutSpace(mock, claim)
}

func SelectWithOutSpace(mock sqlmock.Sqlmock, claim map[string]interface{}) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, claim["title"], claim["slug"], claim["claim_date"], claim["checked_date"], claim["claim_sources"],
				claim["description"], claim["claimant_id"], claim["rating_id"], claim["review"], claim["review_tag_line"], claim["review_sources"], 1))

	// Preload Claimant & Rating
	rating.SelectWithOutSpace(mock, rating.Data)
	claimant.SelectWithOutSpace(mock, claimant.Data)

}

func SelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["title"], Data["slug"], Data["claim_date"], Data["checked_date"], Data["claim_sources"],
				Data["description"], Data["claimant_id"], Data["rating_id"], Data["review"], Data["review_tag_line"], Data["review_sources"], 1))
}

//check claim exits or not
func recordNotFoundMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(100, 1).
		WillReturnRows(sqlmock.NewRows(columns))
}

// check claim associated with any post before deleting
func claimPostExpect(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "post_claims"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func claimCountQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "claims"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func validateAssociations(result *httpexpect.Object) {
	result.Value("claimant").
		Object().
		ContainsMap(claimant.Data)

	result.Value("rating").
		Object().
		ContainsMap(rating.Data)
}
