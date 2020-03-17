package resolvers

import (
	"context"
	"errors"
	"log"

	"github.com/monarkatfactly/dega-api-go.git/graph/generated"
	"github.com/monarkatfactly/dega-api-go.git/graph/loaders"
	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *factcheckResolver) Claims(ctx context.Context, obj *models.Factcheck) ([]*models.Claim, error) {
	if len(obj.Claims) == 0 {
		return nil, nil
	}

	var allClaimID []string

	for _, claim := range obj.Claims {
		allClaimID = append(allClaimID, claim.ID)
	}

	claims, _ := loaders.GetClaimLoader(ctx).LoadAll(allClaimID)
	return claims, nil
}

func (r *factcheckResolver) Status(ctx context.Context, obj *models.Factcheck) (*models.Status, error) {
	return loaders.GetStatusLoader(ctx).Load(obj.Status.ID)
}

func (r *factcheckResolver) Media(ctx context.Context, obj *models.Factcheck) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

func (r *factcheckResolver) Categories(ctx context.Context, obj *models.Factcheck) ([]*models.Category, error) {
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

func (r *factcheckResolver) Tags(ctx context.Context, obj *models.Factcheck) ([]*models.Tag, error) {
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

func (r *factcheckResolver) DegaUsers(ctx context.Context, obj *models.Factcheck) ([]*models.User, error) {
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

func (r *factcheckResolver) Schemas(ctx context.Context, obj *models.Factcheck) ([]*models.Schemas, error) {
	claims, err := r.Claims(ctx, obj)

	if err != nil {
		log.Fatal(err)
	}

	client := obj.ClientID
	query := bson.M{
		"client_id": client,
	}

	var org *models.Organization = new(models.Organization)
	err = mongo.Factcheck.Collection("organization").FindOne(ctx, query).Decode(&org)
	if err != nil {
		log.Fatal(err)
	}

	orgMediaLogo, err := r.Organization().MediaLogo(ctx, org)

	if err != nil {
		log.Fatal(err)
	}
	var schemas []*models.Schemas

	for _, claim := range claims {
		var schema *models.Schemas = new(models.Schemas)
		var author *models.Author = new(models.Author)
		var reviewRating *models.ReviewRating = new(models.ReviewRating)
		var itemReviewed *models.ItemReviewed = new(models.ItemReviewed)

		var ratingType = "Rating"
		var reviewedType = "Creative work"
		var authorType = "Person"

		reviewRating.Type = &ratingType
		itemReviewed.Type = &reviewedType
		author.Type = &authorType
		itemReviewed.Author = author

		schema.ClaimReviewed = claim.Claim
		authorType = "Organization"
		schema.Author = author
		if org != nil {
			url := org.SiteAddress + "/factcheck" + obj.Slug + "-" + obj.ID
			schema.URL = &url
			author.URL = &org.SiteAddress
			if orgMediaLogo != nil {
				author.Image = &orgMediaLogo.URL
			}
			author.Name = org.Name
			schema.Author = author
		}

		schema.DatePublished = obj.PublishedDate

		rating, err := r.Claim().Rating(ctx, claim)
		if err != nil {
			log.Fatal(err)
		}

		ratingMedia, err := r.Rating().Media(ctx, rating)

		if rating != nil {
			reviewRating.AlternateName = rating.Name
			if rating.NumericValue != 0 {
				reviewRating.RatingValue = rating.NumericValue
			}
			if ratingMedia != nil {
				reviewRating.Image = &ratingMedia.URL
			}
		}

		reviewRating.BestRating = 5
		reviewRating.WorstRating = 1

		schema.ReviewRating = reviewRating

		claimant, err := r.Claim().Claimant(ctx, claim)

		if err != nil {
			log.Fatal(err)
		}

		claimantMedia, err := r.Claimant().Media(ctx, claimant)
		if claimant != nil {
			author.Name = claimant.Name
			if claimantMedia != nil {
				author.Image = &claimantMedia.URL

			}
			itemReviewed.Author = author
		}
		schema.ItemReviewed = itemReviewed
		schemas = append(schemas, schema)
	}

	return schemas, nil
}

func (r *queryResolver) Factchecks(ctx context.Context, categories []string, tags []string, users []string, page *int, limit *int, sortBy *string, sortOrder *string) (*models.FactchecksPaging, error) {
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

	cursor, err := mongo.Factcheck.Collection("factcheck").Find(ctx, query, opts)

	if err != nil {
		log.Fatal(err)
	}

	count, err := mongo.Factcheck.Collection("factcheck").CountDocuments(ctx, query)

	if err != nil {
		log.Fatal(err)
	}

	var nodes []*models.Factcheck

	for cursor.Next(ctx) {
		var each *models.Factcheck
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		nodes = append(nodes, each)
	}

	var result *models.FactchecksPaging = new(models.FactchecksPaging)

	result.Nodes = nodes
	result.Total = int(count)

	return result, nil
}

func (r *queryResolver) Factcheck(ctx context.Context, id string) (*models.Factcheck, error) {

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

	var result *models.Factcheck

	err = mongo.Factcheck.Collection("factcheck").FindOne(ctx, query).Decode(&result)

	if err != nil {
		return nil, nil
	}

	return result, nil
}

// Factcheck model resolver
func (r *Resolver) Factcheck() generated.FactcheckResolver { return &factcheckResolver{r} }

type factcheckResolver struct{ *Resolver }
