package resolvers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
)

func (r *queryResolver) Users(ctx context.Context, page *int, limit *int, sortBy *string, sortOrder *string) (*models.UsersPaging, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, nil
	}

	post := &models.Post{}
	post.SpaceID = sID

	err = config.DB.First(post).Error
	if err != nil {
		return nil, nil
	}

	postAuthor := &models.PostAuthor{}
	postAuthor.PostID = post.ID

	err = config.DB.First(postAuthor).Error
	if err != nil {
		return nil, nil
	}

	space := &models.Space{}
	space.ID = sID

	err = config.DB.First(space).Error
	if err != nil {
		return nil, nil
	}

	url := fmt.Sprint(config.KavachURL, "/organisations/", space.OrganisationID, "/users")

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

	result := models.UsersPaging{}
	result.Nodes = users
	result.Total = len(users)

	return &result, nil
}

func (r *queryResolver) User(ctx context.Context, id int) (*models.User, error) {
	sID, err := validator.GetSpace(ctx)

	if err != nil {
		return nil, nil
	}

	space := &models.Space{}
	space.ID = sID

	config.DB.First(space)

	userMap := make(map[int]models.User)
	url := fmt.Sprint(config.KavachURL, "/organisations/", space.OrganisationID, "/users")

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

	if user, found := userMap[id]; found {
		return &user, nil
	}

	return nil, nil
}
