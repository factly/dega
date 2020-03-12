package resolvers

import (
	"context"
	"errors"
	"log"

	"github.com/monarkatfactly/dega-api-go.git/graph/generated"
	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *queryResolver) Sitemap(ctx context.Context) (*models.Sitemaps, error) {
	var ok models.Sitemaps = "OKAY"
	return &ok, nil
}

func (r *sitemapsResolver) Categories(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Core.Collection("category").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Sitemap

	for cursor.Next(ctx) {
		var each *models.Sitemap
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	return nodes, nil
}

func (r *sitemapsResolver) Tags(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Core.Collection("tag").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Sitemap

	for cursor.Next(ctx) {
		var each *models.Sitemap
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	return nodes, nil
}

func (r *sitemapsResolver) Users(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Core.Collection("degaUsers").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Sitemap

	for cursor.Next(ctx) {
		var each *models.Sitemap
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	return nodes, nil
}

func (r *sitemapsResolver) Formats(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Core.Collection("format").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Sitemap

	for cursor.Next(ctx) {
		var each *models.Sitemap
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	return nodes, nil
}

func (r *sitemapsResolver) Statuses(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Core.Collection("status").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Sitemap

	for cursor.Next(ctx) {
		var each *models.Sitemap
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	return nodes, nil
}

func (r *sitemapsResolver) Posts(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Core.Collection("post").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Sitemap

	for cursor.Next(ctx) {
		var each *models.Sitemap
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	return nodes, nil
}

func (r *sitemapsResolver) Factchecks(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Factcheck.Collection("factcheck").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Sitemap

	for cursor.Next(ctx) {
		var each *models.Sitemap
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	return nodes, nil
}

func (r *sitemapsResolver) Claims(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Factcheck.Collection("claim").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Sitemap

	for cursor.Next(ctx) {
		var each *models.Sitemap
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	return nodes, nil
}

func (r *sitemapsResolver) Claimants(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Factcheck.Collection("claimant").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Sitemap

	for cursor.Next(ctx) {
		var each *models.Sitemap
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	return nodes, nil
}

func (r *sitemapsResolver) Ratings(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	client := ctx.Value("client").(string)

	if client == "" {
		return nil, errors.New("client id missing")
	}

	query := bson.M{
		"client_id": client,
	}

	cursor, err := mongo.Factcheck.Collection("rating").Find(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Sitemap

	for cursor.Next(ctx) {
		var each *models.Sitemap
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	return nodes, nil
}

// Sitemaps model resolver
func (r *Resolver) Sitemaps() generated.SitemapsResolver { return &sitemapsResolver{r} }

type sitemapsResolver struct{ *Resolver }
