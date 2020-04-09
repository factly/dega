package resolvers

import (
	"context"
	"errors"
	"log"

	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *postResolver) Status(ctx context.Context, obj *models.Post) (*models.Status, error) {
	return loaders.GetStatusLoader(ctx).Load(obj.Status.ID)
}

func (r *postResolver) Format(ctx context.Context, obj *models.Post) (*models.Format, error) {
	return loaders.GetFormatLoader(ctx).Load(obj.Format.ID)
}

func (r *postResolver) Media(ctx context.Context, obj *models.Post) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

func (r *postResolver) Categories(ctx context.Context, obj *models.Post) ([]*models.Category, error) {
	if len(obj.Categories) == 0 {
		return nil, nil
	}

	var allCategoryID []string

	for _, category := range obj.Categories {
		allCategoryID = append(allCategoryID, category.ID)
	}

	categories, _ := loaders.GetCategoryLoader(ctx).LoadAll(allCategoryID)
	return categories, nil
}

func (r *postResolver) Tags(ctx context.Context, obj *models.Post) ([]*models.Tag, error) {
	if len(obj.Tags) == 0 {
		return nil, nil
	}

	var allTagID []string

	for _, tag := range obj.Tags {
		allTagID = append(allTagID, tag.ID)
	}

	tags, _ := loaders.GetTagLoader(ctx).LoadAll(allTagID)
	return tags, nil
}

func (r *postResolver) DegaUsers(ctx context.Context, obj *models.Post) ([]*models.User, error) {
	if len(obj.DegaUsers) == 0 {
		return nil, nil
	}

	var allUserID []string

	for _, user := range obj.DegaUsers {
		allUserID = append(allUserID, user.ID)
	}

	users, _ := loaders.GetUserLoader(ctx).LoadAll(allUserID)
	return users, nil
}

func (r *queryResolver) Posts(ctx context.Context, categories []string, tags []string, users []string, page *int, limit *int, sortBy *string, sortOrder *string) (*models.PostsPaging, error) {

	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	if len(categories) > 0 {
		keys := []primitive.ObjectID{}

		for _, id := range categories {
			rid, err := primitive.ObjectIDFromHex(id)

			if err == nil {
				keys = append(keys, rid)
			}
		}

		query["categories.$id"] = bson.M{"$in": keys}
	}

	if len(tags) > 0 {
		keys := []primitive.ObjectID{}

		for _, id := range tags {
			cid, err := primitive.ObjectIDFromHex(id)

			if err == nil {
				keys = append(keys, cid)
			}
		}

		query["tags.$id"] = bson.M{"$in": keys}
	}

	if len(users) > 0 {
		keys := []primitive.ObjectID{}

		for _, id := range users {
			cid, err := primitive.ObjectIDFromHex(id)

			if err == nil {
				keys = append(keys, cid)
			}
		}

		query["degaUsers.$id"] = bson.M{"$in": keys}
	}

	pageLimit := 10
	pageNo := 1
	pageSortBy := "created_date"
	pageSortOrder := -1

	if limit != nil {
		pageLimit = *limit
	}
	if page != nil {
		pageNo = *page
	}

	if sortBy != nil {
		pageSortBy = *sortBy
	}
	if sortOrder != nil && *sortOrder == "ASC" {
		pageSortOrder = 1
	}

	opts := options.Find().SetSort(bson.D{{pageSortBy, pageSortOrder}}).SetSkip(int64((pageNo - 1) * pageLimit)).SetLimit(int64(pageLimit))

	cursor, err := mongo.Core.Collection("post").Find(ctx, query, opts)

	if err != nil {
		log.Fatal(err)
	}

	count, err := mongo.Core.Collection("post").CountDocuments(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Post

	for cursor.Next(ctx) {
		var each *models.Post
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	var result *models.PostsPaging = new(models.PostsPaging)

	result.Nodes = nodes
	result.Total = int(count)

	return result, nil
}

func (r *queryResolver) Post(ctx context.Context, id string) (*models.Post, error) {

	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	oid, err := primitive.ObjectIDFromHex(id)

	if err != nil {
		return nil, nil
	}

	query := bson.M{
		"client_id": client,
		"_id":       oid,
	}

	var result *models.Post

	err = mongo.Core.Collection("post").FindOne(ctx, query).Decode(&result)

	if err != nil {
		return nil, nil
	}

	return result, nil
}

// Post model resolver
func (r *Resolver) Post() generated.PostResolver { return &postResolver{r} }

type postResolver struct{ *Resolver }
