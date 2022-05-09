package resolvers

import (
	"context"
	"fmt"
	"log"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
)

func (r *menuResolver) ID(ctx context.Context, obj *models.Menu) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *menuResolver) SpaceID(ctx context.Context, obj *models.Menu) (int, error) {
	return int(obj.SpaceID), nil
}

func (r *menuResolver) Menu(ctx context.Context, obj *models.Menu) (interface{}, error) {
	return obj.Menu, nil
}

func (r *menuResolver) MetaFields(ctx context.Context, obj *models.Menu) (interface{}, error) {
	return obj.MetaFields, nil
}

func (r *queryResolver) Menu(ctx context.Context) (*models.MenusPaging, error) {

	log.Println(" Menu resolver entry")

	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.MenusPaging{}
	result.Nodes = make([]*models.Menu, 0)
	var total int64

	config.DB.Model(&models.Menu{}).Where(&models.Menu{
		SpaceID: sID,
	}).Count(&total).Order("id desc").Find(&result.Nodes)

	result.Total = int(total)

	return result, nil
}

// Menu model resolver
func (r *Resolver) Menu() generated.MenuResolver { return &menuResolver{r} }

type menuResolver struct{ *Resolver }
