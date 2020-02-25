package loaders

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const loadersKey = "loaders"

const ratingLoaderKey = "ratingloader"
const claimantLoaderKey = "claimantloader"
const mediumLoaderKey = "mediumloader"
const statusLoaderKey = "statusloader"
const formatLoaderKey = "formatloader"
const organizationLoaderKey = "organizationloader"
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
				var keys []primitive.ObjectID

				for _, id := range ids {
					rid, err := primitive.ObjectIDFromHex(id)

					if err != nil {
						log.Fatal(err)
					}
					keys = append(keys, rid)
				}

				cursor, err := mongo.Factcheck.Collection("rating").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

				if err != nil {
					log.Fatal(err)
				}

				var ratings []*models.Rating

				for cursor.Next(ctx) {
					var each *models.Rating
					err := cursor.Decode(&each)
					if err != nil {
						log.Fatal(err)
					}
					ratings = append(ratings, each)
				}

				r := make(map[string]*models.Rating, len(ids))

				for _, rating := range ratings {
					r[rating.ID] = rating
				}

				results := make([]*models.Rating, len(ids))

				for i, id := range ids {
					if r[id] == nil {
						log.Fatal(r[id])
					}
					results[i] = r[id]
				}

				return results, nil
			},
		}

		claimantloader := ClaimantLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Claimant, []error) {
				var keys []primitive.ObjectID

				for _, id := range ids {
					rid, err := primitive.ObjectIDFromHex(id)

					if err != nil {
						log.Fatal(err)
					}
					keys = append(keys, rid)
				}

				cursor, err := mongo.Factcheck.Collection("claimant").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

				if err != nil {
					log.Fatal(err)
				}

				var claimants []*models.Claimant

				for cursor.Next(ctx) {
					var each *models.Claimant
					err := cursor.Decode(&each)
					if err != nil {
						log.Fatal(err)
					}
					claimants = append(claimants, each)
				}

				c := make(map[string]*models.Claimant, len(ids))

				for _, claimant := range claimants {
					c[claimant.ID] = claimant
				}

				results := make([]*models.Claimant, len(ids))

				for i, id := range ids {
					if c[id] == nil {
						log.Fatal(c[id])
					}
					results[i] = c[id]
				}

				return results, nil
			},
		}

		mediumloader := MediumLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Medium, []error) {
				var keys []primitive.ObjectID

				for _, id := range ids {
					rid, err := primitive.ObjectIDFromHex(id)

					if err != nil {
						log.Fatal(err)
					}
					keys = append(keys, rid)
				}

				cursor, err := mongo.Core.Collection("media").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

				if err != nil {
					log.Fatal(err)
				}

				var media []*models.Medium

				for cursor.Next(ctx) {
					var each *models.Medium
					err := cursor.Decode(&each)
					if err != nil {
						log.Fatal(err)
					}
					media = append(media, each)
				}

				m := make(map[string]*models.Medium, len(ids))

				for _, medium := range media {
					m[medium.ID] = medium
				}

				results := make([]*models.Medium, len(ids))

				for i, id := range ids {
					if m[id] == nil {
						log.Fatal(m[id])
					}
					results[i] = m[id]
				}

				return results, nil
			},
		}

		statusloader := StatusLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Status, []error) {
				var keys []primitive.ObjectID

				for _, id := range ids {
					rid, err := primitive.ObjectIDFromHex(id)

					if err != nil {
						log.Fatal(err)
					}
					keys = append(keys, rid)
				}

				cursor, err := mongo.Core.Collection("status").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

				if err != nil {
					log.Fatal(err)
				}

				var statuses []*models.Status

				for cursor.Next(ctx) {
					var each *models.Status
					err := cursor.Decode(&each)
					if err != nil {
						log.Fatal(err)
					}
					statuses = append(statuses, each)
				}

				s := make(map[string]*models.Status, len(ids))

				for _, status := range statuses {
					s[status.ID] = status
				}

				results := make([]*models.Status, len(ids))

				for i, id := range ids {
					if s[id] == nil {
						log.Fatal(s[id])
					}
					results[i] = s[id]
				}

				return results, nil
			},
		}

		formatloader := FormatLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Format, []error) {
				var keys []primitive.ObjectID

				for _, id := range ids {
					rid, err := primitive.ObjectIDFromHex(id)

					if err != nil {
						log.Fatal(err)
					}
					keys = append(keys, rid)
				}

				cursor, err := mongo.Core.Collection("format").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

				if err != nil {
					log.Fatal(err)
				}

				var formats []*models.Format

				for cursor.Next(ctx) {
					var each *models.Format
					err := cursor.Decode(&each)
					if err != nil {
						log.Fatal(err)
					}
					formats = append(formats, each)
				}

				f := make(map[string]*models.Format, len(ids))

				for _, format := range formats {
					f[format.ID] = format
				}

				results := make([]*models.Format, len(ids))

				for i, id := range ids {
					if f[id] == nil {
						log.Fatal(f[id])
					}
					results[i] = f[id]
				}

				return results, nil
			},
		}

		organizationloader := OrganizationLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Organization, []error) {
				var keys []primitive.ObjectID

				for _, id := range ids {
					rid, err := primitive.ObjectIDFromHex(id)

					if err != nil {
						log.Fatal(err)
					}
					keys = append(keys, rid)
				}

				cursor, err := mongo.Core.Collection("organization").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

				if err != nil {
					log.Fatal(err)
				}

				var organizations []*models.Organization

				for cursor.Next(ctx) {
					var each *models.Organization
					err := cursor.Decode(&each)
					if err != nil {
						log.Fatal(err)
					}
					organizations = append(organizations, each)
				}

				f := make(map[string]*models.Organization, len(ids))

				for _, organization := range organizations {
					f[organization.ID] = organization
				}

				results := make([]*models.Organization, len(ids))

				for i, id := range ids {
					if f[id] == nil {
						log.Fatal(f[id])
					}
					results[i] = f[id]
				}

				return results, nil
			},
		}

		claimloader := ClaimLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Claim, []error) {
				var keys []primitive.ObjectID

				for _, id := range ids {
					rid, err := primitive.ObjectIDFromHex(id)

					if err != nil {
						log.Fatal(err)
					}
					keys = append(keys, rid)
				}

				cursor, err := mongo.Factcheck.Collection("claim").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

				if err != nil {
					log.Fatal(err)
				}

				var claims []*models.Claim

				for cursor.Next(ctx) {
					var each *models.Claim
					err := cursor.Decode(&each)
					if err != nil {
						log.Fatal(err)
					}
					claims = append(claims, each)
				}

				c := make(map[string]*models.Claim, len(ids))

				for _, claim := range claims {
					c[claim.ID] = claim
				}

				results := make([]*models.Claim, len(ids))

				for i, id := range ids {
					if c[id] == nil {
						log.Fatal(c[id])
					}
					results[i] = c[id]
				}

				return results, nil
			},
		}

		categoryloader := CategoryLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Category, []error) {
				var keys []primitive.ObjectID

				for _, id := range ids {
					rid, err := primitive.ObjectIDFromHex(id)

					if err != nil {
						log.Fatal(err)
					}
					keys = append(keys, rid)
				}

				cursor, err := mongo.Core.Collection("category").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

				if err != nil {
					log.Fatal(err)
				}

				var categories []*models.Category

				for cursor.Next(ctx) {
					var each *models.Category
					err := cursor.Decode(&each)
					if err != nil {
						log.Fatal(err)
					}
					categories = append(categories, each)
				}

				c := make(map[string]*models.Category, len(ids))

				for _, category := range categories {
					c[category.ID] = category
				}

				results := make([]*models.Category, len(ids))

				for i, id := range ids {
					if c[id] == nil {
						log.Fatal(c[id])
					}
					results[i] = c[id]
				}

				return results, nil
			},
		}

		tagloader := TagLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.Tag, []error) {
				var keys []primitive.ObjectID

				for _, id := range ids {
					rid, err := primitive.ObjectIDFromHex(id)

					if err != nil {
						log.Fatal(err)
					}
					keys = append(keys, rid)
				}

				cursor, err := mongo.Core.Collection("tag").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

				if err != nil {
					log.Fatal(err)
				}

				var tags []*models.Tag

				for cursor.Next(ctx) {
					var each *models.Tag
					err := cursor.Decode(&each)
					if err != nil {
						log.Fatal(err)
					}
					tags = append(tags, each)
				}

				t := make(map[string]*models.Tag, len(ids))

				for _, tag := range tags {
					t[tag.ID] = tag
				}

				results := make([]*models.Tag, len(ids))

				for i, id := range ids {
					if t[id] == nil {
						log.Fatal(t[id])
					}
					results[i] = t[id]
				}

				return results, nil
			},
		}

		userloader := UserLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(ids []string) ([]*models.User, []error) {
				var keys []primitive.ObjectID

				for _, id := range ids {
					rid, err := primitive.ObjectIDFromHex(id)

					if err != nil {
						log.Fatal(err)
					}
					keys = append(keys, rid)
				}

				cursor, err := mongo.Core.Collection("dega_user").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

				if err != nil {
					log.Fatal(err)
				}

				var users []*models.User

				for cursor.Next(ctx) {
					var each *models.User
					err := cursor.Decode(&each)
					if err != nil {
						log.Fatal(err)
					}
					users = append(users, each)
				}

				u := make(map[string]*models.User, len(ids))

				for _, user := range users {
					u[user.ID] = user
				}

				results := make([]*models.User, len(ids))

				for i, id := range ids {
					if u[id] == nil {
						log.Fatal(u[id])
					}
					results[i] = u[id]
				}

				return results, nil
			},
		}

		v := values{map[string]interface{}{
			claimantLoaderKey:     &claimantloader,
			ratingLoaderKey:       &ratingloader,
			mediumLoaderKey:       &mediumloader,
			statusLoaderKey:       &statusloader,
			formatLoaderKey:       &formatloader,
			organizationLoaderKey: &organizationloader,
			claimLoaderKey:        &claimloader,
			categoryLoaderKey:     &categoryloader,
			tagLoaderKey:          &tagloader,
			userLoaderKey:         &userloader,
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

// GetStatusLoader batches and caches status
func GetStatusLoader(ctx context.Context) *StatusLoader {
	return ctx.Value(loadersKey).(values).Get(statusLoaderKey).(*StatusLoader)
}

// GetFormatLoader batches and caches format
func GetFormatLoader(ctx context.Context) *FormatLoader {
	return ctx.Value(loadersKey).(values).Get(formatLoaderKey).(*FormatLoader)
}

// GetOrganizationLoader batches and caches organization
func GetOrganizationLoader(ctx context.Context) *OrganizationLoader {
	return ctx.Value(loadersKey).(values).Get(organizationLoaderKey).(*OrganizationLoader)
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
