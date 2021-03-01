package claim

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/test/service/core/permissions/space"
	"github.com/factly/dega-server/test/service/fact-check/claimant"
	"github.com/factly/dega-server/test/service/fact-check/rating"
	"github.com/factly/dega-server/util"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

var updatedClaim = map[string]interface{}{
	"title":        "Claim",
	"claim_date":   time.Now(),
	"checked_date": time.Now(),
	"claim_sources": postgres.Jsonb{
		RawMessage: []byte(`{"type":"claim sources"}`),
	},
	"description": test.NilJsonb(),
	"claimant_id": uint(1),
	"rating_id":   uint(1),
	"review": postgres.Jsonb{
		RawMessage: []byte(`{"type":"review"}`),
	},
	"review_tag_line": postgres.Jsonb{
		RawMessage: []byte(`{"type":"review tag line"}`),
	},
	"review_sources": postgres.Jsonb{
		RawMessage: []byte(`{"type":"review sources"}`),
	},
}

func TestClaimUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.MockServer()
	defer gock.DisableNetworking()

	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	s := test.RunDefaultNATSServer()
	defer s.Shutdown()
	util.ConnectNats()

	t.Run("invalid claim id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		e.PUT(path).
			WithPath("claim_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("claim record not found", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		recordNotFoundMock(mock)

		e.PUT(path).
			WithPath("claim_id", "100").
			WithHeaders(headers).
			WithJSON(updatedClaim).
			Expect().
			Status(http.StatusNotFound)
	})
	t.Run("Unable to decode claim data", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.PUT(path).
			WithPath("claim_id", 1).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("Unprocessable claim", func(t *testing.T) {

		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		e.PUT(path).
			WithPath("claim_id", 1).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)

	})

	t.Run("update claim", func(t *testing.T) {
		updatedClaim["slug"] = "claim"
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectWithSpace(mock)

		claimUpdateMock(mock, updatedClaim, nil)
		mock.ExpectCommit()

		result := e.PUT(path).
			WithPath("claim_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaim).
			Expect().
			Status(http.StatusOK).JSON().Object()
		validateAssociations(result)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update claim by id with empty slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		updatedClaim["slug"] = "claim"
		SelectWithSpace(mock)

		slugCheckMock(mock, Data)

		claimUpdateMock(mock, updatedClaim, nil)
		mock.ExpectCommit()

		Data["slug"] = ""
		result := e.PUT(path).
			WithPath("claim_id", 1).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).JSON().Object()
		Data["slug"] = "claim"
		validateAssociations(result)
		test.ExpectationsMet(t, mock)

	})

	t.Run("update claim with different slug", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)
		updatedClaim["slug"] = "claim-test"

		SelectWithSpace(mock)

		mock.ExpectQuery(`SELECT slug, space_id FROM "claims"`).
			WithArgs(fmt.Sprint(updatedClaim["slug"], "%"), 1).
			WillReturnRows(sqlmock.NewRows([]string{"slug", "space_id"}))

		claimUpdateMock(mock, updatedClaim, nil)
		mock.ExpectCommit()

		result := e.PUT(path).
			WithPath("claim_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaim).
			Expect().
			Status(http.StatusOK).JSON().Object()
		validateAssociations(result)
		test.ExpectationsMet(t, mock)

	})
	t.Run("claimant do not belong to same space", func(t *testing.T) {
		updatedClaim["slug"] = "claim"
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectWithSpace(mock)

		mock.ExpectBegin()
		claimant.EmptyRowMock(mock)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("claim_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaim).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)

	})

	t.Run("rating do not belong to same space", func(t *testing.T) {
		updatedClaim["slug"] = "claim"
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectWithSpace(mock)

		mock.ExpectBegin()
		claimant.SelectWithSpace(mock)
		rating.EmptyRowMock(mock)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("claim_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaim).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)

	})

	t.Run("update claim when meili is down", func(t *testing.T) {
		test.DisableMeiliGock(testServer.URL)
		updatedClaim["slug"] = "claim"
		test.CheckSpaceMock(mock)
		space.SelectQuery(mock, 1)

		SelectWithSpace(mock)

		claimUpdateMock(mock, updatedClaim, nil)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("claim_id", 1).
			WithHeaders(headers).
			WithJSON(updatedClaim).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
