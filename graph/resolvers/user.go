package resolvers

import (
	"context"
	"log"

	"github.com/monarkatfactly/dega-api-go.git/graph/generated"
	"github.com/monarkatfactly/dega-api-go.git/graph/loaders"
	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *userResolver) OrganizationDefault(ctx context.Context, obj *models.User) (*models.Organization, error) {
	return loaders.GetOrganizationLoader(ctx).Load(obj.OrganizationDefault.ID)
}

func (r *userResolver) OrganizationCurrent(ctx context.Context, obj *models.User) (*models.Organization, error) {
	return loaders.GetOrganizationLoader(ctx).Load(obj.OrganizationCurrent.ID)
}

func (r *userResolver) Media(ctx context.Context, obj *models.User) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

func (r *queryResolver) Users(ctx context.Context, page *int, limit *int) (*models.UsersPaging, error) {

	query := bson.M{}

	pageLimit := 10
	pageNo := 1
	if limit != nil && *limit > 0 && *limit <= 20 {
		pageLimit = *limit
	}
	if page != nil {
		pageNo = *page
	}

	opts := options.Find().SetSkip(int64((pageNo - 1) * pageLimit)).SetLimit(int64(pageLimit))
	cursor, err := mongo.Core.Collection("dega_user").Find(ctx, query, opts)

	if err != nil {
		log.Fatal(err)
	}

	count, err := mongo.Core.Collection("dega_user").CountDocuments(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.User

	for cursor.Next(ctx) {
		var each *models.User
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	var result *models.UsersPaging = new(models.UsersPaging)

	result.Nodes = nodes
	result.Total = int(count)

	return result, nil
}

// User model resolver
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type userResolver struct{ *Resolver }
