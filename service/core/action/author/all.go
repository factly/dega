package author

import (
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

// All - to return all authors
func All(sID int, uID int) (map[string]model.Author, error) {

	space := &model.Space{}
	space.ID = uint(sID)

	err := config.DB.First(&space).Error

	if err != nil {
		return nil, err
	}

	authors := make(map[string]model.Author)

	authors = Mapper(strconv.Itoa(space.OrganisationID), strconv.Itoa(uID))

	return authors, nil

}
