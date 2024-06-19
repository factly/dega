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

func TestClaimCreate(t *testing.T) {

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

	// unprocessable entity
	t.Run("unprocessable entity", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// unable to decode claim
	t.Run("unable to decode claim", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	// create claim
	t.Run("create claim", func(t *testing.T) {
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated).
			JSON().Object().ContainsMap(resData)
	})

	t.Run("cannot parse claim description", func(t *testing.T) {
		Data["description"] = "invalid"
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusUnprocessableEntity)
		Data["description"] = TestDescriptionFromRequest
	})

	// claimant does not belong to same space
	t.Run("claimant does not belong to same space", func(t *testing.T) {
		Data["claimant_id"] = 100
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		Data["claimant_id"] = insertClaimantData.ID
	})

	// rating does not belong to same space
	t.Run("rating does not belong to same space", func(t *testing.T) {
		Data["rating_id"] = 100
		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		Data["rating_id"] = insertRatingData.ID
	})
}
