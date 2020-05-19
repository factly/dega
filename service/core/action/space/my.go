package space

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

type organizationUser struct {
	config.Base
	Role string `gorm:"column:role" json:"role"`
}

type orgWithSpace struct {
	config.Base
	Title      string           `gorm:"column:title" json:"title"`
	Slug       string           `gorm:"column:slug;unique_index" json:"slug"`
	Permission organizationUser `json:"permission"`
	Spaces     []model.Space    `json:"spaces"`
}

func my(w http.ResponseWriter, r *http.Request) {
	req, err := http.NewRequest("GET", os.Getenv("KAVACH_URL")+"/organizations/my", nil)
	req.Header.Set("X-User", r.Header.Get("X-User"))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	allOrg := []orgWithSpace{}
	err = json.Unmarshal(body, &allOrg)

	var allOrgIDs []int

	for _, each := range allOrg {
		allOrgIDs = append(allOrgIDs, int(each.ID))
	}

	var allSpaces []model.Space

	config.DB.Model(model.Space{}).Where("organisation_id IN (?)", allOrgIDs).Find(&allSpaces)

	result := []orgWithSpace{}

	for _, each := range allOrg {
		eachOrgWithAllSpaces := []model.Space{}
		for _, space := range allSpaces {
			if space.OrganisationID == int(each.ID) {
				eachOrgWithAllSpaces = append(eachOrgWithAllSpaces, space)
			}
		}
		each.Spaces = eachOrgWithAllSpaces
		result = append(result, each)
	}

	render.JSON(w, http.StatusOK, result)
}
