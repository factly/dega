package claim

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestClaimUpdate(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	//delete all entries from the db and insert some data
	config.DB.Exec("DELETE FROM claimants")
	config.DB.Exec("DELETE FROM claims")
	config.DB.Exec("DELETE FROM space_permissions")
	config.DB.Exec("DELETE FROM media")
	insertClaimantData := model.Claimant{
		Name:    "Test Claimant",
		Slug:    "test-claimant",
		SpaceID: TestSpaceID,
	}

	if err := config.DB.Model(&model.Claimant{}).Create(&insertClaimantData).Error; err != nil {
		log.Fatal(err)
	}
	insertRatingData := model.Rating{
		Name:         "Test Rating",
		Slug:         "test-rating",
		NumericValue: 5,
		SpaceID:      TestSpaceID,
	}
	if err := config.DB.Model(&model.Rating{}).Create(&insertRatingData).Error; err != nil {
		log.Fatal(err)
	}
	insertData := model.Claim{
		Claim: "Test Claim",
		Slug:  "test-claim",

		ClaimSources: TestClaimSources,
		Fact:         TestFact,
		ReviewSources: postgres.Jsonb{
			RawMessage: []byte(`{"type":"review sources"}`),
		},
		SpaceID:    TestSpaceID,
		ClaimantID: insertClaimantData.ID,
		RatingID:   insertRatingData.ID,
		Claimant:   insertClaimantData,
		Rating:     insertRatingData,
	}
	Data["claimant_id"] = insertClaimantData.ID
	Data["rating_id"] = insertRatingData.ID

	config.DB.Model(&model.Claim{}).Create(&insertData)

	e := httpexpect.New(t, testServer.URL)

	// invalid claim id
	t.Run("invalid claim id", func(t *testing.T) {
		e.PUT(path).
			WithPath("claim_id", "invalid_id").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
	})

	// claim record not found

	t.Run("claim record not found", func(t *testing.T) {
		e.PUT(path).
			WithPath("claim_id", "1000000").
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
	})

	// unable to decode claim data
	t.Run("unable to decode claim data", func(t *testing.T) {
		e.PUT(path).
			WithPath("claim_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// unprocessable claim
	t.Run("unprocessable claim", func(t *testing.T) {
		e.PUT(path).
			WithPath("claim_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// update claim
	t.Run("update claim", func(t *testing.T) {
		Data["claim"] = "Updated Claim 1"
		Data["slug"] = "updated-claim-1"
		e.PUT(path).
			WithPath("claim_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"claim": "Updated Claim 1",
				"slug":  "updated-claim-1",
			})
	})

	// update claim with empty slug
	t.Run("update claim with empty slug", func(t *testing.T) {
		Data["claim"] = "Updated Claim 2"
		Data["slug"] = ""
		resData["claim"] = "Updated Claim 2"
		resData["slug"] = "updated-claim-2"
		e.PUT(path).
			WithPath("claim_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{
				"claim": "Updated Claim 2",
				"slug":  "updated-claim-2",
			})
	})

	// claimant do not belong to same space
	t.Run("claimant do not belong to same space", func(t *testing.T) {
		Data["claimant_id"] = 987632
		e.PUT(path).
			WithPath("claim_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
	})

	// rating do not belong to same space
	t.Run("rating do not belong to same space", func(t *testing.T) {
		Data["rating_id"] = 987632
		e.PUT(path).
			WithPath("claim_id", insertData.ID).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
	})
}
