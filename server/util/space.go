package util

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/timex"
	"github.com/spf13/viper"
)

func GetSpacefromKavach(userID, orgID, spaceID uint) (*model.Space, error) {
	applicationID, err := GetApplicationID(uint(userID), "dega")
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("GET", viper.GetString("kavach_url")+fmt.Sprintf("/organisations/%d/applications/", orgID)+fmt.Sprintf("%d", applicationID)+"/spaces/"+fmt.Sprintf("%d", spaceID), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-User", fmt.Sprintf("%d", userID))
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{Timeout: time.Second * time.Duration(timex.HTTP_TIMEOUT)}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	spaceObjectfromKavach := &model.KavachSpace{}
	err = json.NewDecoder(resp.Body).Decode(spaceObjectfromKavach)
	if err != nil {
		return nil, err
	}

	spaceObjectforDega := &model.Space{}
	spaceObjectforDega.ID = spaceObjectfromKavach.ID
	spaceObjectforDega.CreatedAt = spaceObjectfromKavach.CreatedAt
	spaceObjectforDega.UpdatedAt = spaceObjectfromKavach.UpdatedAt
	spaceObjectforDega.DeletedAt = spaceObjectfromKavach.DeletedAt
	spaceObjectforDega.CreatedByID = spaceObjectfromKavach.CreatedByID
	spaceObjectforDega.UpdatedByID = spaceObjectfromKavach.UpdatedByID
	spaceObjectforDega.Name = spaceObjectfromKavach.Name
	spaceObjectforDega.Slug = spaceObjectfromKavach.Slug
	spaceObjectforDega.Description = spaceObjectfromKavach.Description
	spaceObjectforDega.ApplicationID = spaceObjectfromKavach.ApplicationID
	spaceObjectforDega.OrganisationID = int(spaceObjectfromKavach.OrganisationID)
	err = json.Unmarshal(spaceObjectfromKavach.Metadata.RawMessage, &spaceObjectforDega)
	if err != nil {
		return nil, err

	}
	return spaceObjectforDega, nil
}
