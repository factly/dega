package loaders

import (
	"context"
	"net/http"
	"time"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/logger"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/util"
)

type contextKey string

const loadersKey contextKey = "loaders"

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

// DataloaderMiddleware to add middleware in main
func DataloaderMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ratingloader := RatingLoader{
			maxBatch: 100,
			wait:     1 * time.Second,
			fetch: func(ids []string) ([]*models.Rating, []error) {
				ratings := make([]*models.Rating, 0)

				err := config.DB.Model(&models.Rating{}).Where("id IN ? ", ids).Find(&ratings).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				ratingsMap := map[string]*models.Rating{}

				for _, rating := range ratings {
					ratingsMap[rating.ID.String()] = rating
				}

				result := make([]*models.Rating, 0)

				for _, id := range ids {
					m, found := ratingsMap[id]
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

				claimants := make([]*models.Claimant, 0)

				err := config.DB.Model(&models.Claimant{}).Where("id IN ? ", ids).Find(&claimants).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				claimantsMap := map[string]*models.Claimant{}

				for _, claimant := range claimants {
					claimantsMap[claimant.ID.String()] = claimant
				}

				result := make([]*models.Claimant, 0)

				for _, id := range ids {
					m, found := claimantsMap[id]
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

				media := make([]*models.Medium, 0)

				err := config.DB.Model(&models.Medium{}).Where("id IN ? ", ids).Find(&media).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				mediaMap := map[string]*models.Medium{}

				for _, medium := range media {
					mediaMap[medium.ID.String()] = medium
				}

				result := make([]*models.Medium, 0)

				for _, id := range ids {
					m, found := mediaMap[id]
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

				formats := make([]*models.Format, 0)

				err := config.DB.Model(&models.Format{}).Where("id IN ? ", ids).Find(&formats).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				formatsMap := map[string]*models.Format{}

				for _, format := range formats {
					formatsMap[format.ID.String()] = format
				}

				result := make([]*models.Format, 0)

				for _, id := range ids {
					m, found := formatsMap[id]
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

				claims := make([]*models.Claim, 0)

				err := config.DB.Model(&models.Claim{}).Where("id IN ? ", ids).Find(&claims).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				claimsMap := map[string]*models.Claim{}

				for _, claim := range claims {
					claimsMap[claim.ID.String()] = claim
				}

				result := make([]*models.Claim, 0)

				for _, id := range ids {
					m, found := claimsMap[id]
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

				categories := make([]*models.Category, 0)

				err := config.DB.Model(&models.Category{}).Where("id IN ? ", ids).Find(&categories).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				categoriesMap := map[string]*models.Category{}

				for _, category := range categories {
					categoriesMap[category.ID.String()] = category
				}

				result := make([]*models.Category, 0)

				for _, id := range ids {
					m, found := categoriesMap[id]
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

				tags := make([]*models.Tag, 0)

				err := config.DB.Model(&models.Tag{}).Where("id IN ? ", ids).Find(&tags).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				tagsMap := map[string]*models.Tag{}

				for _, tag := range tags {
					tagsMap[tag.ID.String()] = tag
				}

				result := make([]*models.Tag, 0)

				for _, id := range ids {
					m, found := tagsMap[id]
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

				users, err := util.GetSpaceMembers(ids)

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				result := make([]*models.User, 0)

				for _, id := range ids {
					for _, user := range users {
						if user.ID == id {
							u := models.User{
								ID:          user.ID,
								Email:       user.Human.Email.Email,
								FirstName:   user.Human.Profile.FirstName,
								LastName:    user.Human.Profile.LastName,
								DisplayName: user.Human.Profile.DisplayName,
							}
							result = append(result, &u)
						}
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
