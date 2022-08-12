package space

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	//"github.com/factly/dega-server/service/core/action/user"
	//"github.com/factly/dega-server/util"
	"github.com/jinzhu/gorm/dialects/postgres"
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
type policyReq struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Slug        string         `json:"slug"`
	Permissions postgres.Jsonb `json:"permissions"`
	Roles       []uint         `json:"roles"`
}

type orgWithSpace struct {
	Organisation organisation           `json:"organisation"`
	Permission   organisationUser       `json:"permission"`
	Applications []application          `json:"applications"`
	Spaces       []spaceWithPermissions `json:"spaces"`
}

type organisation struct {
	config.Base
	Title string `gorm:"column:title" json:"title"`
	Slug  string `gorm:"column:slug;unique_index" json:"slug"`
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

	// Fetched all organisations of the user
	req, err := http.NewRequest("GET", viper.GetString("kavach_url")+"/organisations/my", nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}
	if resp.StatusCode != 200 {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
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

	var allOrgIDs []int

	for _, each := range allOrg {
		allOrgIDs = append(allOrgIDs, int(each.Organisation.ID))
	}

	// Fetched all the spaces related to all the organisations

	var allSpaces = make([]model.Space, 0)

	//	config.DB.Model(model.Space{}).Where("organisation_id IN (?)", allOrgIDs).Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").Find(&allSpaces)

	for _, org_id := range allOrgIDs {
		req, err := http.NewRequest("GET", viper.GetString("kavach_url")+"/organisations/"+strconv.Itoa(org_id)+"/applications/"+viper.GetString("dega_application_id")+"/spaces/", nil)
		req.Header.Set("X-User", strconv.Itoa(uID))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		org_spaces := []model.Space{}
		err = json.NewDecoder(resp.Body).Decode(&org_spaces)

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		fmt.Println(org_spaces, "org_spaces_test")

		for _, space := range org_spaces {
			allSpaces = append(allSpaces, space)
		}

	}
	//fetch all the keto policies

	policyList := make([]policyReq, 0)
	fmt.Println(allSpaces, "allSpaces")
	for _, space := range allSpaces {
		fmt.Println("strconv.Itoa(space.OrganisationID)", strconv.Itoa(space.OrganisationID))
		fmt.Println("+strconv.Itoa(int(space.ID))", strconv.Itoa(int(space.ID)))
		req, err := http.NewRequest("GET", viper.GetString("kavach_url")+"/organisations/"+strconv.Itoa(space.OrganisationID)+"/applications/"+viper.GetString("dega_application_id")+"/spaces/"+strconv.Itoa(int(space.ID))+"/policy/", nil)
		req.Header.Set("X-User", strconv.Itoa(uID))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		space_policies := []policyReq{}
		err = json.NewDecoder(resp.Body).Decode(&space_policies)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		for _, space_policy := range space_policies {
			policyList = append(policyList, space_policy)
		}
	}

	adminPerm := model.Permission{
		Resource: "admin",
		Actions:  []string{"admin"},
	}

	result := make([]orgWithSpace, 0)

	for _, each := range allOrg {
		spaceWithPermArr := []spaceWithPermissions{}
		for _, space := range allSpaces {
			if space.OrganisationID == int(each.Organisation.ID) {
				//*need to figure out
				//	var services []string
				//	services, err = util.GetAllowedServices(space.ID)
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
				//**need to figure out
				// if each.Permission.Role != "owner" {
				// 	permissions := user.GetPermissions(int(each.ID), int(space.ID), uID, policyList)
				// 	spaceWithPerm := spaceWithPermissions{
				// 		Space:           space,
				// 		Permissions:     permissions,
				// 		AllowedServices: services,
				// 	}
				// 	spaceWithPermArr = append(spaceWithPermArr, spaceWithPerm)
				// }
				//else {
				adminSpaceWithPerm := spaceWithPermissions{
					Space:           space,
					Permissions:     []model.Permission{adminPerm},
					AllowedServices: []string{"core", "fact-checks", "podcast"},
				}
				spaceWithPermArr = append(spaceWithPermArr, adminSpaceWithPerm)
				//	}
			}
		}
		each.Spaces = spaceWithPermArr
		result = append(result, each)
	}

	renderx.JSON(w, http.StatusOK, result)
}
