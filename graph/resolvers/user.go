package resolvers

import (
	"context"

	"github.com/factly/dega-api/graph/models"
)

func (r *queryResolver) Users(ctx context.Context, page *int, limit *int, sortBy *string, sortOrder *string) (*models.UsersPaging, error) {

	var result *models.UsersPaging

	return result, nil
}

func (r *queryResolver) User(ctx context.Context, id int) (*models.User, error) {

	var result *models.User
	return result, nil
}
