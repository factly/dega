package space

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/util"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/spf13/viper"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
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
	util.Space
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
	uID, err := util.GetUser(r.Context())
	log.Println("----------uID----------------", uID)
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

	client := httpx.CustomHttpClient()
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
		client := httpx.CustomHttpClient()
		resp, err := client.Do(req)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != 200 {
			continue
		}
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
			spaceWithPerm.MetaFields = eachSpace.MetaFields
			spaceSettings := model.SpaceSettings{}
			config.DB.Model(&model.SpaceSettings{}).Where(&model.SpaceSettings{
				SpaceID: eachSpace.ID,
			}).Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").First(&spaceSettings)

			spaceWithPerm.SiteTitle = spaceSettings.SiteTitle
			spaceWithPerm.TagLine = spaceSettings.TagLine
			spaceWithPerm.SiteAddress = spaceSettings.SiteAddress
			if spaceSettings.LogoID != nil {
				spaceWithPerm.LogoID = spaceSettings.LogoID
				spaceWithPerm.Logo = spaceSettings.Logo
			}
			if spaceSettings.FavIconID != nil {
				spaceWithPerm.FavIconID = spaceSettings.FavIconID
				spaceWithPerm.FavIcon = spaceSettings.FavIcon
			}
			if spaceSettings.LogoMobileID != nil {
				spaceWithPerm.LogoMobileID = spaceSettings.LogoMobileID
				spaceWithPerm.LogoMobile = spaceSettings.LogoMobile
			}

			if spaceSettings.MobileIconID != nil {
				spaceWithPerm.MobileIconID = spaceSettings.MobileIconID
				spaceWithPerm.MobileIcon = spaceSettings.MobileIcon
			}

			spaceWithPerm.VerificationCodes = spaceSettings.VerificationCodes
			spaceWithPerm.SocialMediaURLs = spaceSettings.SocialMediaURLs
			spaceWithPerm.ContactInfo = spaceSettings.ContactInfo
			spaceWithPerm.Analytics = spaceSettings.Analytics
			spaceWithPerm.HeaderCode = spaceSettings.HeaderCode
			spaceWithPerm.FooterCode = spaceSettings.FooterCode

			spaceWithPerm.SiteAddress = spaceSettings.SiteAddress
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

			spaceWithPerm.AllowedServices, err = util.GetAllowedServices(eachSpace.ID, organisation.Organisation.ID, uint(uID))
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
