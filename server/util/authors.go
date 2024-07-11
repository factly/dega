package util

import (
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/zitadel"
	"github.com/spf13/viper"
)

func GetAuthors(token, orgID string, ids []string) (map[string]model.Author, error) {
	if token == "" {
		token = viper.GetString("ZITADEL_PERSONAL_ACCESS_TOKEN")
	}
	zitadelUsers, err := zitadel.GetOrganisationUsers(token, orgID, ids)

	if err != nil {
		return nil, err
	}

	// Adding author
	authors := make(map[string]model.Author)
	for _, zitadelUser := range zitadelUsers {
		author := model.Author{
			ID:          zitadelUser.ID,
			DisplayName: zitadelUser.Human.Profile.DisplayName,
			FirstName:   zitadelUser.Human.Profile.FirstName,
			LastName:    zitadelUser.Human.Profile.LastName,
		}
		authors[zitadelUser.ID] = author
	}

	return authors, nil
}
