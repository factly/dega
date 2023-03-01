package claim

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/gavv/httpexpect/v2"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/h2non/gock.v1"
)

func TestClaimDetails(t *testing.T) {
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
		SpaceID:         TestSpaceID,
		ClaimantID:      insertClaimantData.ID,
		RatingID:        insertRatingData.ID,
		Claimant:        insertClaimantData,
		Rating:          insertRatingData,
		Description:     TestDescriptionJson,
		DescriptionHTML: TestDescriptionHtml,
	}
	Data["claimant_id"] = insertClaimantData.ID
	Data["rating_id"] = insertRatingData.ID

	config.DB.Model(&model.Claim{}).Create(&insertData)

	var insertSpacePermissionData = coreModel.SpacePermission{
		SpaceID:   TestSpaceID,
		FactCheck: true,
		Media:     100,
		Posts:     100,
		Podcast:   true,
		Episodes:  100,
		Videos:    100,
	}
	config.DB.Model(&coreModel.SpacePermission{}).Create(&insertSpacePermissionData)

	e := httpexpect.New(t, testServer.URL)

	// invalid claim id
	t.Run("invalid claim id", func(t *testing.T) {
		e.GET(path).
			WithPath("claim_id", "invalid_id").
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	// claim record not found

	t.Run("claim record not found", func(t *testing.T) {
		e.GET(path).
			WithPath("claim_id", "10000").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	// get claim by id
	t.Run("get claim by id", func(t *testing.T) {
		resData["claim"] = insertData.Claim
		resData["slug"] = insertData.Slug

		e.GET(path).
			WithPath("claim_id", insertData.ID).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(resData)
	})

}
