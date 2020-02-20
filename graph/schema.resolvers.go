// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
package graph

import (
	"context"
	"log"

	"github.com/monarkatfactly/dega-api-go.git/graph/generated"
	"github.com/monarkatfactly/dega-api-go.git/graph/loaders"
	"github.com/monarkatfactly/dega-api-go.git/graph/models"
	"github.com/monarkatfactly/dega-api-go.git/graph/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (r *claimResolver) Rating(ctx context.Context, obj *models.Claim) (*models.Rating, error) {
	return loaders.GetRatingLoader(ctx).Load(obj.Rating.ID)
}

func (r *claimResolver) Claimant(ctx context.Context, obj *models.Claim) (*models.Claimant, error) {
	return loaders.GetClaimantLoader(ctx).Load(obj.Claimant.ID)
}

func (r *claimantResolver) Media(ctx context.Context, obj *models.Claimant) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

func (r *factcheckResolver) Claims(ctx context.Context, obj *models.Factcheck) ([]*models.Claim, error) {
	var allClaimID []primitive.ObjectID

	for _, claim := range obj.Claims {
		cid, err := primitive.ObjectIDFromHex(claim.ID)

		if err == nil {
			allClaimID = append(allClaimID, cid)
		}
	}

	if len(allClaimID) == 0 {
		return nil, nil
	}

	var results []*models.Claim

	cursor, err := mongo.Factcheck.Collection("claim").Find(ctx, bson.M{"_id": bson.M{"$in": allClaimID}})

	if err != nil {
		log.Fatal(err)
	}

	for cursor.Next(ctx) {
		var each *models.Claim
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}
	return results, nil
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
	var allCategoryID []primitive.ObjectID

	for _, category := range obj.Categories {
		cid, err := primitive.ObjectIDFromHex(category.ID)

		if err == nil {
			allCategoryID = append(allCategoryID, cid)
		}
	}

	if len(allCategoryID) == 0 {
		return nil, nil
	}

	var results []*models.Category

	cursor, err := mongo.Core.Collection("category").Find(ctx, bson.M{"_id": bson.M{"$in": allCategoryID}})

	if err != nil {
		log.Fatal(err)
	}

	for cursor.Next(ctx) {
		var each *models.Category
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}
	return results, nil
}

func (r *factcheckResolver) Tags(ctx context.Context, obj *models.Factcheck) ([]*models.Tag, error) {
	var allTagID []primitive.ObjectID

	for _, tag := range obj.Tags {
		tid, err := primitive.ObjectIDFromHex(tag.ID)

		if err == nil {
			allTagID = append(allTagID, tid)
		}
	}

	var results []*models.Tag

	if len(allTagID) == 0 {
		return results, nil
	}

	cursor, err := mongo.Core.Collection("tag").Find(ctx, bson.M{"_id": bson.M{"$in": allTagID}})

	if err != nil {
		log.Fatal(err)
	}

	for cursor.Next(ctx) {
		var each *models.Tag
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}
	return results, nil
}

func (r *factcheckResolver) DegaUsers(ctx context.Context, obj *models.Factcheck) ([]*models.User, error) {
	var allUserID []primitive.ObjectID

	for _, user := range obj.DegaUsers {
		uid, err := primitive.ObjectIDFromHex(user.ID)

		if err == nil {
			allUserID = append(allUserID, uid)
		}

	}

	var results []*models.User

	if len(allUserID) == 0 {
		return results, nil
	}

	cursor, err := mongo.Core.Collection("dega_user").Find(ctx, bson.M{"_id": bson.M{"$in": allUserID}})

	if err != nil {
		log.Fatal(err)
	}

	for cursor.Next(ctx) {
		var each *models.User
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}
	return results, nil
}

func (r *organizationResolver) MediaLogo(ctx context.Context, obj *models.Organization) (*models.Medium, error) {
	if obj.MediaLogo == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.MediaLogo.ID)
}

func (r *organizationResolver) MediaMobileLogo(ctx context.Context, obj *models.Organization) (*models.Medium, error) {
	if obj.MediaMobileLogo == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.MediaMobileLogo.ID)
}

func (r *organizationResolver) MediaFavicon(ctx context.Context, obj *models.Organization) (*models.Medium, error) {
	if obj.MediaFavicon == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.MediaFavicon.ID)
}

func (r *organizationResolver) MediaMobileIcon(ctx context.Context, obj *models.Organization) (*models.Medium, error) {
	if obj.MediaMobileIcon == nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(obj.MediaMobileIcon.ID)
}

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
	var allCategoryID []primitive.ObjectID

	for _, category := range obj.Categories {
		cid, err := primitive.ObjectIDFromHex(category.ID)

		if err == nil {
			allCategoryID = append(allCategoryID, cid)
		}
	}

	if len(allCategoryID) == 0 {
		return nil, nil
	}

	var results []*models.Category

	cursor, err := mongo.Core.Collection("category").Find(ctx, bson.M{"_id": bson.M{"$in": allCategoryID}})

	if err != nil {
		log.Fatal(err)
	}

	for cursor.Next(ctx) {
		var each *models.Category
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}
	return results, nil
}

func (r *postResolver) Tags(ctx context.Context, obj *models.Post) ([]*models.Tag, error) {
	var allTagID []primitive.ObjectID

	for _, tag := range obj.Tags {
		tid, err := primitive.ObjectIDFromHex(tag.ID)

		if err == nil {
			allTagID = append(allTagID, tid)
		}
	}

	if len(allTagID) == 0 {
		return nil, nil
	}

	var results []*models.Tag

	cursor, err := mongo.Core.Collection("tag").Find(ctx, bson.M{"_id": bson.M{"$in": allTagID}})

	if err != nil {
		log.Fatal(err)
	}

	for cursor.Next(ctx) {
		var each *models.Tag
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}
	return results, nil
}

func (r *postResolver) DegaUsers(ctx context.Context, obj *models.Post) ([]*models.User, error) {
	var allUserID []primitive.ObjectID

	for _, user := range obj.DegaUsers {
		uid, err := primitive.ObjectIDFromHex(user.ID)

		if err == nil {
			allUserID = append(allUserID, uid)
		}
	}

	if len(allUserID) == 0 {
		return nil, nil
	}

	var results []*models.User

	cursor, err := mongo.Core.Collection("dega_user").Find(ctx, bson.M{"_id": bson.M{"$in": allUserID}})

	if err != nil {
		log.Fatal(err)
	}

	for cursor.Next(ctx) {
		var each *models.User
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}
	return results, nil
}

func (r *ratingResolver) Media(ctx context.Context, obj *models.Rating) (*models.Medium, error) {
	if obj.Media == nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(obj.Media.ID)
}

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

func (r *queryResolver) Categories(ctx context.Context) ([]*models.Category, error) {
	cursor, err := mongo.Core.Collection("category").Find(ctx, bson.D{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Category

	for cursor.Next(ctx) {
		var each *models.Category
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}
	return results, nil
}

func (r *queryResolver) Tags(ctx context.Context) ([]*models.Tag, error) {
	cursor, err := mongo.Core.Collection("tag").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Tag

	for cursor.Next(ctx) {
		var each *models.Tag
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *queryResolver) Formats(ctx context.Context) ([]*models.Format, error) {
	cursor, err := mongo.Core.Collection("format").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Format

	for cursor.Next(ctx) {
		var each *models.Format
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *queryResolver) Statuses(ctx context.Context) ([]*models.Status, error) {
	cursor, err := mongo.Core.Collection("status").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Status

	for cursor.Next(ctx) {
		var each *models.Status
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *queryResolver) Media(ctx context.Context) ([]*models.Medium, error) {
	cursor, err := mongo.Core.Collection("media").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Medium

	for cursor.Next(ctx) {
		var each *models.Medium
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *queryResolver) Posts(ctx context.Context) ([]*models.Post, error) {
	cursor, err := mongo.Core.Collection("post").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Post

	for cursor.Next(ctx) {
		var each *models.Post
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *queryResolver) Organizations(ctx context.Context) ([]*models.Organization, error) {
	cursor, err := mongo.Core.Collection("organization").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Organization

	for cursor.Next(ctx) {
		var each *models.Organization
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *queryResolver) Users(ctx context.Context) ([]*models.User, error) {
	cursor, err := mongo.Core.Collection("dega_user").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.User

	for cursor.Next(ctx) {
		var each *models.User
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *queryResolver) Ratings(ctx context.Context) ([]*models.Rating, error) {
	cursor, err := mongo.Factcheck.Collection("rating").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Rating

	for cursor.Next(ctx) {
		var each *models.Rating
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *queryResolver) Claimnats(ctx context.Context) ([]*models.Claimant, error) {
	cursor, err := mongo.Factcheck.Collection("claimnat").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Claimant

	for cursor.Next(ctx) {
		var each *models.Claimant
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *queryResolver) Claims(ctx context.Context) ([]*models.Claim, error) {
	cursor, err := mongo.Factcheck.Collection("claim").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Claim

	for cursor.Next(ctx) {
		var each *models.Claim
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *queryResolver) Factchecks(ctx context.Context) ([]*models.Factcheck, error) {
	cursor, err := mongo.Factcheck.Collection("factcheck").Find(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	var results []*models.Factcheck

	for cursor.Next(ctx) {
		var each *models.Factcheck
		err := cursor.Decode(&each)
		if err != nil {
			log.Fatal(err)
		}
		results = append(results, each)
	}

	return results, nil
}

func (r *Resolver) Claim() generated.ClaimResolver               { return &claimResolver{r} }
func (r *Resolver) Claimant() generated.ClaimantResolver         { return &claimantResolver{r} }
func (r *Resolver) Factcheck() generated.FactcheckResolver       { return &factcheckResolver{r} }
func (r *Resolver) Organization() generated.OrganizationResolver { return &organizationResolver{r} }
func (r *Resolver) Post() generated.PostResolver                 { return &postResolver{r} }
func (r *Resolver) Query() generated.QueryResolver               { return &queryResolver{r} }
func (r *Resolver) Rating() generated.RatingResolver             { return &ratingResolver{r} }
func (r *Resolver) User() generated.UserResolver                 { return &userResolver{r} }

type claimResolver struct{ *Resolver }
type claimantResolver struct{ *Resolver }
type factcheckResolver struct{ *Resolver }
type organizationResolver struct{ *Resolver }
type postResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type ratingResolver struct{ *Resolver }
type userResolver struct{ *Resolver }
