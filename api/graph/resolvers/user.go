package resolvers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/factly/dega-api/config"
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


	posts := make([]models.Post, 0)

	err = config.DB.Model(&models.Post{}).Where(&models.Post{
		SpaceID: uint(sID),
	}).Find(&posts).Error
	if err != nil {
		return nil, nil
	}

	postIDs := make([]uint, 0)
	for _, post := range posts {
		postIDs = append(postIDs, post.ID)
	}

	postAuthor := &models.PostAuthor{}

	err = config.DB.Model(&models.PostAuthor{}).Where("post_id IN (?)", postIDs).First(postAuthor).Error
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

	oID, err := validator.GetOrganisation(ctx)
	if err != nil {
		return nil, nil
	}

	if id == nil && slug == nil {
		return nil, errors.New("please provide either id or slug")
	}

	var userID int
	if id == nil {
		// fetch all posts of current space
		postList := make([]models.Post, 0)
		config.DB.Model(&models.Post{}).Where(&models.Post{
			SpaceID: uint(sID),
		}).Find(&postList)

		postIDs := make([]uint, 0)
		for _, each := range postList {
			postIDs = append(postIDs, each.ID)
		}

		postAuthors := make([]models.PostAuthor, 0)
		config.DB.Model(&models.PostAuthor{}).Where("post_id IN (?)", postIDs).Find(&postAuthors)

		if len(postAuthors) > 0 {
			userID = int(postAuthors[0].AuthorID)
		} else {
			return nil, errors.New("please provide ID instead of slug")
		}
	} else {
		userID = *id
	}

	userMap := make(map[uint]models.User)
	userSlugMap := make(map[string]models.User)
	url := fmt.Sprint(viper.GetString("kavach_url"), "/users/application?application=dega")

	resp, err := requestx.Request("GET", url, nil, map[string]string{
		"Content-Type":   "application/json",
		"X-User":         fmt.Sprint(userID),
		"X-Organisation": fmt.Sprint(oID),
	})

	if err != nil {
		return nil, nil
	}

	defer resp.Body.Close()

	usersResp := models.UsersPaging{}
	err = json.NewDecoder(resp.Body).Decode(&usersResp)
	if err != nil {
		return nil, nil
	}

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
