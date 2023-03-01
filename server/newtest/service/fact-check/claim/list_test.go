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

func TestClaimList(t *testing.T) {
	defer gock.DisableNetworking()
	testServer := httptest.NewServer(service.RegisterRoutes())
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()
	defer testServer.Close()
	e := httpexpect.New(t, testServer.URL)

	config.DB.Exec("DELETE FROM space_permissions")
	config.DB.Exec("DELETE FROM claimants")
	config.DB.Exec("DELETE FROM claims")
	config.DB.Exec("DELETE FROM media")
	config.DB.Exec("DELETE FROM ratings")

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

	t.Run("get empty list of claim", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0, "nodes": []interface{}{}})
	})

	t.Run("get non-empty list of claim", func(t *testing.T) {
		//delete all entries from the db and insert some data

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
		insertData.ID = 100000
		insertData.Claim = "Test Claim 2"
		insertData.Slug = "test-claim-2"
		config.DB.Model(&model.Claim{}).Create(&insertData)
		resData["name"] = insertData.Claim
		resData["slug"] = insertData.Slug
		e.GET(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 2}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(map[string]interface{}{
				"claim": "Test Claim",
				"slug":  "test-claim",
			})
	})

	// get claims with pagination
	t.Run("get claims with pagination", func(t *testing.T) {
		e.GET(basePath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"page":  2,
				"limit": 1,
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 2}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(map[string]interface{}{
				"claim": "Test Claim 2",
				"slug":  "test-claim-2",
			})
	})
}
