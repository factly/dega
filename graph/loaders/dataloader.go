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

const ratingloaderKey = "ratingloader"
const claimantloaderKey = "claimantloader"
const mediumloaderkey = "mediumloader"
const statusloaderkey = "statusloader"
const formatloaderkey = "formatloader"
const organizationloaderkey = "organizationloader"

type Values struct {
	m map[string]interface{}
}

func (v Values) Get(key string) interface{} {
	return v.m[key]
}

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

				var ctx, _ = context.WithTimeout(context.Background(), 10*time.Second)

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

				var ctx, _ = context.WithTimeout(context.Background(), 10*time.Second)

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

				var ctx, _ = context.WithTimeout(context.Background(), 10*time.Second)

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

				var ctx, _ = context.WithTimeout(context.Background(), 10*time.Second)

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

				var ctx, _ = context.WithTimeout(context.Background(), 10*time.Second)

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

				var ctx, _ = context.WithTimeout(context.Background(), 10*time.Second)

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

		v := Values{map[string]interface{}{
			claimantloaderKey:     &claimantloader,
			ratingloaderKey:       &ratingloader,
			mediumloaderkey:       &mediumloader,
			statusloaderkey:       &statusloader,
			formatloaderkey:       &formatloader,
			organizationloaderkey: &organizationloader,
		}}

		ctx := context.WithValue(r.Context(), "loaders", v)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetRatingLoader(ctx context.Context) *RatingLoader {
	return ctx.Value("loaders").(Values).Get(ratingloaderKey).(*RatingLoader)
}

func GetClaimantLoader(ctx context.Context) *ClaimantLoader {
	return ctx.Value("loaders").(Values).Get(claimantloaderKey).(*ClaimantLoader)
}

func GetMediumLoader(ctx context.Context) *MediumLoader {
	return ctx.Value("loaders").(Values).Get(mediumloaderkey).(*MediumLoader)
}

func GetStatusLoader(ctx context.Context) *StatusLoader {
	return ctx.Value("loaders").(Values).Get(statusloaderkey).(*StatusLoader)
}

func GetFormatLoader(ctx context.Context) *FormatLoader {
	return ctx.Value("loaders").(Values).Get(formatloaderkey).(*FormatLoader)
}

func GetOrganizationLoader(ctx context.Context) *OrganizationLoader {
	return ctx.Value("loaders").(Values).Get(organizationloaderkey).(*OrganizationLoader)
}
