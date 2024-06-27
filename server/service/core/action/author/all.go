package author

import (
	"context"

	"github.com/factly/dega-server/service/core/model"
)

// All - to return all authors
func All(ctx context.Context) (map[string]model.Author, error) {
	authors := make(map[string]model.Author)

	// organisationID, err := util.GetOrganisation(ctx)

	// if err != nil {
	// 	return authors, err
	// }

	// userID, err := util.GetUser(ctx)

	// if err != nil {
	// 	return authors, err
	// }

	// authors = Mapper(organisationID, userID)

	return authors, nil

}
