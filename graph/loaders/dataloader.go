package loaders

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RatingsLoader(ctx context.Context) *RatingLoader {
	return &RatingLoader{
		wait:     30 * time.Millisecond,
		maxBatch: 100,
		fetch: func(keys []primitive.ObjectID) ([]*models.Rating, []error) {

			fmt.Println(keys)

			var ratings []*models.Rating
			var results []*models.Rating

			cursor, err := mongo.Factcheck.Collection("rating").Find(ctx, bson.M{"_id": bson.M{"$in": keys}})

			if err != nil {
				log.Fatal(err)
			}

			for cursor.Next(ctx) {
				var each *models.Rating
				err := cursor.Decode(&each)
				if err != nil {
					log.Fatal(err)
				}

				ratings = append(ratings, each)
			}

			r := make(map[string]*models.Rating, len(ratings))

			for _, rating := range ratings {
				if rating != nil {
					r[rating.ID] = rating
				}
			}

			for _, key := range keys {
				results = append(results, r[key.Hex()])
			}
			return results, nil
		},
	}
}
