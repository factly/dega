package author

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int            `json:"total"`
	Nodes []model.Author `json:"nodes"`
}

// list - Get all authors
// @Summary Show all authors
// @Description Get all authors
// @Tags Authors
// @ID get-all-authors
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /core/authors [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	uID, err := util.GetUser(r.Context())

	if err != nil {
		return
	}

	result := paging{}
	result.Nodes = make([]model.Author, 0)

	space := &model.Space{}
	space.ID = uint(sID)

	err = config.DB.First(&space).Error

	if err != nil {
		return
	}

	req, err := http.NewRequest("GET", os.Getenv("KAVACH_URL")+"/organizations/"+strconv.Itoa(space.OrganisationID)+"/users", nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User", strconv.Itoa(uID))
	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()

	users := []model.Author{}
	json.NewDecoder(resp.Body).Decode(&users)

	offset, limit := paginationx.Parse(r.URL.Query())

	total := len(users)
	lowerLimit := offset
	upperLimit := offset + limit
	if offset > total {
		lowerLimit = 0
		upperLimit = 0
	} else if offset+limit > total {
		lowerLimit = offset
		upperLimit = total
	}

	result.Nodes = users[lowerLimit:upperLimit]
	result.Total = total

	renderx.JSON(w, http.StatusOK, result)
}
