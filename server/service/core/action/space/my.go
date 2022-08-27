package space

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/timex"
	"github.com/spf13/viper"

	"github.com/factly/dega-server/config"
	//"github.com/factly/dega-server/service/core/action/policy"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
)

type organisationUser struct {
	config.Base
	Role string `gorm:"column:role" json:"role"`
}

type organisation struct {
	config.Base
	Title string `json:"title"`
	Slug  string `json:"slug"`
}

type orgWithSpace struct {
	Organisation organisation           `json:"organisation"`
	Permission   organisationUser       `json:"permission"`
	Applications []application          `json:"applications"`
	Spaces       []spaceWithPermissions `json:"spaces"`
}

type application struct {
	config.Base
	Name        string        `gorm:"column:name" json:"name"`
	Description string        `gorm:"column:description" json:"description"`
	URL         string        `gorm:"column:url" json:"url"`
	MediumID    *uint         `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium      *model.Medium `gorm:"foreignKey:medium_id" json:"medium"`
}

type spaceWithPermissions struct {
	model.Space
	Permissions     []model.Permission `json:"permissions"`
	AllowedServices []string           `json:"services"`
}

// list - Get all spaces for a user
// @Summary Show all spaces
// @Description Get all spaces
// @Tags Space
// @ID get-all-spaces
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {array} orgWithSpace
// @Router /core/spaces [get]
func my(w http.ResponseWriter, r *http.Request) {
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	applicationID, err := util.GetApplicationID(uint(uID), "dega")
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Fetched all organisations of the user
	req, err := http.NewRequest(http.MethodGet, viper.GetString("kavach_url")+"/organisations/my", nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{Timeout: time.Minute * time.Duration(timex.HTTP_TIMEOUT)}
	resp, err := client.Do(req)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	allOrg := []orgWithSpace{}

	err = json.Unmarshal(body, &allOrg)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	for index, organisation := range allOrg {
		req, err := http.NewRequest("GET", viper.GetString("kavach_url")+"/organisations/"+strconv.Itoa(int(organisation.Organisation.ID))+"/applications/"+fmt.Sprintf("%d", applicationID)+"/spaces/", nil)
		req.Header.Set("X-User", strconv.Itoa(uID))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		client := http.Client{Timeout: time.Minute * time.Duration(timex.HTTP_TIMEOUT)}
		resp, err := client.Do(req)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		defer resp.Body.Close()

		organisationSpacesfromKavach := make([]model.KavachSpace, 0)
		err = json.NewDecoder(resp.Body).Decode(&organisationSpacesfromKavach)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		organisationSpacesforDega := make([]spaceWithPermissions, 0)
		for _, eachSpace := range organisationSpacesfromKavach {
			spaceWithPerm := spaceWithPermissions{}
			spaceWithPerm.ID = eachSpace.ID
			spaceWithPerm.CreatedAt = eachSpace.CreatedAt
			spaceWithPerm.UpdatedAt = eachSpace.UpdatedAt
			spaceWithPerm.DeletedAt = eachSpace.DeletedAt
			spaceWithPerm.UpdatedByID = eachSpace.UpdatedByID
			spaceWithPerm.CreatedByID = eachSpace.CreatedByID
			spaceWithPerm.Name = eachSpace.Name
			spaceWithPerm.Slug = eachSpace.Slug
			spaceWithPerm.Description = eachSpace.Description
			spaceWithPerm.ApplicationID = eachSpace.ApplicationID
			spaceWithPerm.OrganisationID = int(eachSpace.OrganisationID)
			err = json.Unmarshal(eachSpace.Metadata.RawMessage, &spaceWithPerm)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
			if organisation.Permission.Role == "owner" {
				adminPerm := model.Permission{
					Resource: "admin",
					Actions:  []string{"admin"},
				}
				spaceWithPerm.Permissions = append(spaceWithPerm.Permissions, adminPerm)
			} else {
				spaceWithPerm.Permissions, err = util.GetPermissions(organisation.Organisation.ID, eachSpace.ApplicationID, eachSpace.ID, uint(uID))
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}
			}

			spaceWithPerm.AllowedServices, err = util.GetAllowedServices(eachSpace.ID)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
			organisationSpacesforDega = append(organisationSpacesforDega, spaceWithPerm)
		}
		organisation.Spaces = organisationSpacesforDega
		allOrg[index] = organisation
	}

	renderx.JSON(w, http.StatusOK, allOrg)
}
