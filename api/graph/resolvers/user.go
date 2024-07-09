package resolvers

import (
	"context"
	"errors"
	"fmt"

	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/logger"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/google/uuid"
)

func (r *userResolver) ID(ctx context.Context, obj *models.User) (string, error) {
	return fmt.Sprint(obj.ID), nil
}
func (r *userResolver) Medium(ctx context.Context, obj *models.User) (*models.Medium, error) {
	if obj.FeaturedMediumID == 0 {
		return nil, nil
	}

	return obj.Medium, nil
}

func (r *userResolver) SocialMediaUrls(ctx context.Context, obj *models.User) (interface{}, error) {
	return obj.SocialMediaURLs, nil
}

func (r *queryResolver) Users(ctx context.Context, page *int, limit *int) (*models.UsersPaging, error) {
	users := make([]models.User, 0)

	offset, pageLimit := util.Parse(page, limit)
	upperLimit := offset + pageLimit
	if upperLimit > len(users) {
		upperLimit = len(users)
	}
	result := models.UsersPaging{}
	// result.Nodes = users[offset:upperLimit]
	result.Total = len(users)

	return &result, nil
}

func (r *queryResolver) User(ctx context.Context, id *string) (*models.User, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil || sID == uuid.Nil {
		return nil, nil
	}

	if id == nil {
		return nil, errors.New("please provide either id")
	}

	ids := []string{*id}

	users, err := util.GetSpaceMembers(ids)

	if err != nil {
		logger.Error(err)
		return nil, errors.New("unable to fetch users")
	}

	if len(users) != 0 && users[0].ID == *id {
		u := models.User{
			ID:          users[0].ID,
			Email:       users[0].Human.Email.Email,
			FirstName:   users[0].Human.Profile.FirstName,
			LastName:    users[0].Human.Profile.LastName,
			DisplayName: users[0].Human.Profile.DisplayName,
		}
		return &u, nil
	}

	return nil, nil
}

// User model resolver
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type userResolver struct{ *Resolver }
