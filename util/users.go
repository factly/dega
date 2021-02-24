package util

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/factly/dega-vito/config"
	"github.com/factly/dega-vito/model"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/requestx"
	"github.com/spf13/viper"
)

// AllAuthors - to return all authors
func AllAuthors(ctx context.Context, sID uint, uID uint) (map[string]model.Author, error) {
	authors := make(map[string]model.Author)

	space := &model.Space{}
	space.ID = uint(sID)

	err := config.DB.First(&space).Error
	if err != nil {
		return authors, err
	}

	url := fmt.Sprint(viper.GetString("kavach_url"), "/organisations/", space.OrganisationID, "/users")

	resp, err := requestx.Request("GET", url, nil, map[string]string{
		"X-User": fmt.Sprint(uID),
	})

	if err != nil {
		return authors, err
	}

	defer resp.Body.Close()

	users := []model.Author{}
	err = json.NewDecoder(resp.Body).Decode(&users)

	if err != nil {
		loggerx.Error(err)
	}

	for _, u := range users {
		authors[fmt.Sprint(u.ID)] = u
	}

	return authors, nil
}
