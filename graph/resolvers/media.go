package resolvers

import (
	"context"
	"fmt"
	"time"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"gorm.io/gorm"
)

func (r *mediumResolver) ID(ctx context.Context, obj *models.Medium) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *mediumResolver) SpaceID(ctx context.Context, obj *models.Medium) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *mediumResolver) URL(ctx context.Context, obj *models.Medium) (interface{}, error) {
	return obj.URL, nil
}

func (r *queryResolver) Media(ctx context.Context) ([]*models.Medium, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := []*models.Medium{}

	ctxTimeout, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()

	config.DB.Session(&gorm.Session{Context: ctxTimeout}).Model(&models.Medium{}).Where(&models.Medium{
		SpaceID: sID,
	}).Find(&result)

	return result, nil
}

// Medium model resolver
func (r *Resolver) Medium() generated.MediumResolver { return &mediumResolver{r} }

type mediumResolver struct{ *Resolver }
