package resolvers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
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

	space := &models.Space{}
	space.ID = sID

	err = config.DB.First(space).Error
	if err != nil {
		return nil, nil
	}

	url := fmt.Sprint(viper.GetString("kavach_url"), "/organisations/", space.OrganisationID, "/users")

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, nil
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User", fmt.Sprint(postAuthor.AuthorID))
	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return nil, nil
	}

	defer resp.Body.Close()

	users := []*models.User{}
	err = json.NewDecoder(resp.Body).Decode(&users)

	if err != nil {
		return nil, nil
	}

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

func (r *queryResolver) User(ctx context.Context, id int) (*models.User, error) {
	sID, err := validator.GetSpace(ctx)

	if err != nil || sID == 0 {
		return nil, nil
	}

	space := &models.Space{}
	space.ID = sID

	config.DB.First(space)

	userMap := make(map[uint]models.User)
	url := fmt.Sprint(viper.GetString("kavach_url"), "/organisations/", space.OrganisationID, "/users")

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, nil
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User", fmt.Sprint(id))
	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return nil, nil
	}

	defer resp.Body.Close()

	users := []models.User{}
	err = json.NewDecoder(resp.Body).Decode(&users)

	if err != nil {
		return nil, nil
	}

	for _, u := range users {
		userMap[u.ID] = u
	}

	if user, found := userMap[uint(id)]; found {
		return &user, nil
	}

	return nil, nil
}

// User model resolver
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type userResolver struct{ *Resolver }
