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
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Rating, []error) {
				keys := util.Converter(ids)

				result := make([]*models.Rating, 0)

				err := config.DB.Model(&models.Rating{}).Where(keys).Order("id desc").Find(&result).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				return result, nil
			},
		}

		claimantloader := ClaimantLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Claimant, []error) {
				keys := util.Converter(ids)

				result := make([]*models.Claimant, 0)

				err := config.DB.Model(&models.Claimant{}).Where(keys).Order("id desc").Find(&result).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				return result, nil
			},
		}

		mediumloader := MediumLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Medium, []error) {
				keys := util.Converter(ids)

				result := make([]*models.Medium, 0)

				err := config.DB.Model(&models.Medium{}).Where(keys).Order("id desc").Find(&result).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				return result, nil
			},
		}

		formatloader := FormatLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Format, []error) {
				keys := util.Converter(ids)

				result := make([]*models.Format, 0)

				err := config.DB.Model(&models.Format{}).Where(keys).Order("id desc").Find(&result).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				return result, nil
			},
		}

		claimloader := ClaimLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Claim, []error) {
				keys := util.Converter(ids)

				result := make([]*models.Claim, 0)

				err := config.DB.Model(&models.Claim{}).Where(keys).Order("id desc").Find(&result).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				return result, nil
			},
		}

		categoryloader := CategoryLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Category, []error) {
				keys := util.Converter(ids)

				result := make([]*models.Category, 0)

				err := config.DB.Model(&models.Category{}).Where(keys).Order("id desc").Find(&result).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				return result, nil
			},
		}

		tagloader := TagLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Tag, []error) {
				keys := util.Converter(ids)

				result := make([]*models.Tag, 0)

				err := config.DB.Model(&models.Tag{}).Where(keys).Order("id desc").Find(&result).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
				}

				return result, nil
			},
		}

		userloader := UserLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.User, []error) {
				keys := util.Converter(ids)

				result := make([]*models.User, 0)

				err := config.DB.Model(&models.User{}).Where(keys).Order("id desc").Find(&result).Error

				if err != nil {
					logger.Error(err)
					return nil, nil
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
