package resolvers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/factly/x/requestx"
	"github.com/spf13/viper"
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
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, nil
	}

	spaceToken, err := validator.GetSpaceToken(ctx)
	if err != nil {
		return nil, errors.New("space token not there")
	}
	url := fmt.Sprint(viper.GetString("kavach_url"), "/users/space/", sID)

	resp, err := requestx.Request("GET", url, nil, map[string]string{
		"Content-Type":  "application/json",
		"X-Space-Token": spaceToken,
	})

	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	usersResp := models.UsersPaging{}
	err = json.NewDecoder(resp.Body).Decode(&usersResp)
	if err != nil {
		return nil, nil
	}

	users := usersResp.Nodes

	offset, pageLimit := util.Parse(page, limit)
	upperLimit := offset + pageLimit
	if upperLimit > len(users) {
		upperLimit = len(users)
	}
	result := models.UsersPaging{}
	result.Nodes = users[offset:upperLimit]
	result.Total = len(users)

	return &result, nil
}

func (r *queryResolver) User(ctx context.Context, id *int, slug *string) (*models.User, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil || sID == 0 {
		return nil, nil
	}
	
	spaceToken, err := validator.GetSpaceToken(ctx)
	if err != nil {
		return nil, errors.New("space token not there")
	}

	if id == nil && slug == nil {
		return nil, errors.New("please provide either id or slug")
	}

	url := fmt.Sprint(viper.GetString("kavach_url"), "/users/space/", sID)

	resp, err := requestx.Request("GET", url, nil, map[string]string{
		"Content-Type":  "application/json",
		"X-Space-Token": spaceToken,
	})

	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	usersResp := models.UsersPaging{}
	err = json.NewDecoder(resp.Body).Decode(&usersResp)
	if err != nil {
		return nil, nil
	}

	userMap := make(map[uint]models.User)
	userSlugMap := make(map[string]models.User)

	for _, u := range usersResp.Nodes {
		userMap[u.ID] = *u
		userSlugMap[u.Slug] = *u
	}

	if id != nil {
		if user, found := userMap[uint(*id)]; found {
			return &user, nil
		}
	} else {
		if user, found := userSlugMap[*slug]; found {
			return &user, nil
		}
	}

	return nil, nil
}

// User model resolver
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type userResolver struct{ *Resolver }
