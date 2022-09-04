package author

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/factly/x/errorx"
	"github.com/factly/x/middlewarex"
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

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	oID, err := util.GetOrganisation(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := paging{}
	result.Nodes = make([]model.Author, 0)

	url := fmt.Sprint(viper.GetString("kavach_url"), "/organisations/", oID, "/users")

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User", strconv.Itoa(uID))
	client := httpx.CustomHttpClient()
	resp, err := client.Do(req)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	defer resp.Body.Close()

	users := make([]model.Author, 0)
	err = json.NewDecoder(resp.Body).Decode(&users)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

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
