package loaders

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/logger"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/spf13/viper"
)

const loadersKey = "loaders"

const ratingLoaderKey = "ratingloader"
const claimantLoaderKey = "claimantloader"
const mediumLoaderKey = "mediumloader"
const formatLoaderKey = "formatloader"
const claimLoaderKey = "claimloader"
const categoryLoaderKey = "categoryloader"
const tagLoaderKey = "tagloader"
const userLoaderKey = "userloader"

type values struct {
	m map[string]interface{}
}

func (v values) Get(key string) interface{} {
	return v.m[key]
}

var ctx = context.Background()

// DataloaderMiddleware to add middleware in main
func DataloaderMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ratingloader := RatingLoader{
			maxBatch: 100,
			wait:     1 * time.Second,
			fetch: func(ids []string) ([]*models.Rating, []error) {
				keys := util.Converter(ids)

				ratings := make([]*models.Rating, 0)

				err := config.DB.Model(&models.Rating{}).Where(keys).Find(&ratings).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				ratingsMap := map[uint]*models.Rating{}

				for _, rating := range ratings {
					ratingsMap[rating.ID] = rating
				}

				result := make([]*models.Rating, 0)

				for _, key := range keys {
					m, found := ratingsMap[key]
					if found {
						result = append(result, m)
					} else {
						result = append(result, nil)
					}
				}

				return result, nil
			},
		}

		claimantloader := ClaimantLoader{
			maxBatch: 100,
			wait:     1 * time.Second,
			fetch: func(ids []string) ([]*models.Claimant, []error) {
				keys := util.Converter(ids)

				claimants := make([]*models.Claimant, 0)

				err := config.DB.Model(&models.Claimant{}).Where(keys).Find(&claimants).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				claimantsMap := map[uint]*models.Claimant{}

				for _, claimant := range claimants {
					claimantsMap[claimant.ID] = claimant
				}

				result := make([]*models.Claimant, 0)

				for _, key := range keys {
					m, found := claimantsMap[key]
					if found {
						result = append(result, m)
					} else {
						result = append(result, nil)
					}
				}

				return result, nil
			},
		}

		mediumloader := MediumLoader{
			maxBatch: 100,
			wait:     1 * time.Second,
			fetch: func(ids []string) ([]*models.Medium, []error) {
				keys := util.Converter(ids)

				media := make([]*models.Medium, 0)

				err := config.DB.Model(&models.Medium{}).Where(keys).Find(&media).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				mediaMap := map[uint]*models.Medium{}

				for _, medium := range media {
					mediaMap[medium.ID] = medium
				}

				result := make([]*models.Medium, 0)

				for _, key := range keys {
					m, found := mediaMap[key]
					if found {
						result = append(result, m)
					} else {
						result = append(result, nil)
					}
				}

				return result, nil
			},
		}

		formatloader := FormatLoader{
			maxBatch: 100,
			wait:     1 * time.Second,
			fetch: func(ids []string) ([]*models.Format, []error) {
				keys := util.Converter(ids)

				formats := make([]*models.Format, 0)

				err := config.DB.Model(&models.Format{}).Where(keys).Find(&formats).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				formatsMap := map[uint]*models.Format{}

				for _, format := range formats {
					formatsMap[format.ID] = format
				}

				result := make([]*models.Format, 0)

				for _, key := range keys {
					m, found := formatsMap[key]
					if found {
						result = append(result, m)
					} else {
						result = append(result, nil)
					}
				}

				return result, nil
			},
		}

		claimloader := ClaimLoader{
			maxBatch: 100,
			wait:     1 * time.Second,
			fetch: func(ids []string) ([]*models.Claim, []error) {
				keys := util.Converter(ids)

				claims := make([]*models.Claim, 0)

				err := config.DB.Model(&models.Claim{}).Where(keys).Find(&claims).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				claimsMap := map[uint]*models.Claim{}

				for _, claim := range claims {
					claimsMap[claim.ID] = claim
				}

				result := make([]*models.Claim, 0)

				for _, key := range keys {
					m, found := claimsMap[key]
					if found {
						result = append(result, m)
					} else {
						result = append(result, nil)
					}
				}

				return result, nil
			},
		}

		categoryloader := CategoryLoader{
			maxBatch: 100,
			wait:     1 * time.Second,
			fetch: func(ids []string) ([]*models.Category, []error) {
				keys := util.Converter(ids)

				categories := make([]*models.Category, 0)

				err := config.DB.Model(&models.Category{}).Where(keys).Find(&categories).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				categoriesMap := map[uint]*models.Category{}

				for _, category := range categories {
					categoriesMap[category.ID] = category
				}

				result := make([]*models.Category, 0)

				for _, key := range keys {
					m, found := categoriesMap[key]
					if found {
						result = append(result, m)
					} else {
						result = append(result, nil)
					}
				}

				return result, nil
			},
		}

		tagloader := TagLoader{
			maxBatch: 100,
			wait:     1 * time.Second,
			fetch: func(ids []string) ([]*models.Tag, []error) {
				keys := util.Converter(ids)

				tags := make([]*models.Tag, 0)

				err := config.DB.Model(&models.Tag{}).Where(keys).Find(&tags).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				tagsMap := map[uint]*models.Tag{}

				for _, tag := range tags {
					tagsMap[tag.ID] = tag
				}

				result := make([]*models.Tag, 0)

				for _, key := range keys {
					m, found := tagsMap[key]
					if found {
						result = append(result, m)
					} else {
						result = append(result, nil)
					}
				}

				return result, nil
			},
		}

		userloader := UserLoader{
			maxBatch: 100,
			wait:     1 * time.Second,
			fetch: func(ids []string) ([]*models.User, []error) {
				rctx := r.Context()

				sID, err := validator.GetSpace(rctx)

				if err != nil {
					return nil, nil
				}

				space := &models.Space{}
				space.ID = sID

				config.DB.First(space)

				keys := util.Converter(ids)

				result := make([]*models.User, 0)

				userMap := make(map[uint]models.User)
				url := fmt.Sprint(viper.GetString("kavach_url"), "/organisations/", space.OrganisationID, "/users")

				req, err := http.NewRequest("GET", url, nil)
				if err != nil {
					return result, nil
				}
				req.Header.Set("Content-Type", "application/json")
				req.Header.Set("X-User", fmt.Sprint(keys[0]))
				client := &http.Client{}
				resp, err := client.Do(req)

				if err != nil {
					return result, nil
				}

				defer resp.Body.Close()

				users := []models.User{}
				err = json.NewDecoder(resp.Body).Decode(&users)

				if err != nil {
					return result, nil
				}

				for _, u := range users {
					userMap[u.ID] = u
				}

				for _, key := range keys {
					if user, found := userMap[key]; found {
						result = append(result, &user)
					}
				}

				return result, nil
			},
		}

		v := values{map[string]interface{}{
			claimantLoaderKey: &claimantloader,
			ratingLoaderKey:   &ratingloader,
			mediumLoaderKey:   &mediumloader,
			formatLoaderKey:   &formatloader,
			claimLoaderKey:    &claimloader,
			categoryLoaderKey: &categoryloader,
			tagLoaderKey:      &tagloader,
			userLoaderKey:     &userloader,
		}}

		ctx := context.WithValue(r.Context(), loadersKey, v)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetRatingLoader batches and caches rating
func GetRatingLoader(ctx context.Context) *RatingLoader {
	return ctx.Value(loadersKey).(values).Get(ratingLoaderKey).(*RatingLoader)
}

// GetClaimantLoader batches and caches claimant
func GetClaimantLoader(ctx context.Context) *ClaimantLoader {
	return ctx.Value(loadersKey).(values).Get(claimantLoaderKey).(*ClaimantLoader)
}

// GetMediumLoader batches and caches medium
func GetMediumLoader(ctx context.Context) *MediumLoader {
	return ctx.Value(loadersKey).(values).Get(mediumLoaderKey).(*MediumLoader)
}

// GetFormatLoader batches and caches format
func GetFormatLoader(ctx context.Context) *FormatLoader {
	return ctx.Value(loadersKey).(values).Get(formatLoaderKey).(*FormatLoader)
}

// GetClaimLoader batches and caches claim
func GetClaimLoader(ctx context.Context) *ClaimLoader {
	return ctx.Value(loadersKey).(values).Get(claimLoaderKey).(*ClaimLoader)
}

// GetCategoryLoader batches and caches category
func GetCategoryLoader(ctx context.Context) *CategoryLoader {
	return ctx.Value(loadersKey).(values).Get(categoryLoaderKey).(*CategoryLoader)
}

// GetTagLoader batches and caches tag
func GetTagLoader(ctx context.Context) *TagLoader {
	return ctx.Value(loadersKey).(values).Get(tagLoaderKey).(*TagLoader)
}

// GetUserLoader batches and caches user
func GetUserLoader(ctx context.Context) *UserLoader {
	return ctx.Value(loadersKey).(values).Get(userLoaderKey).(*UserLoader)
}
