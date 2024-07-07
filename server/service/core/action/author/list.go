package author

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/zitadel"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
	"github.com/spf13/viper"
)

// list response
type paging struct {
	Total int64          `json:"total"`
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
func List(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := paging{}
	result.Nodes = make([]model.Author, 0)

	// get space users
	authors := make([]model.Author, 0)

	spaceUsers := make([]model.SpaceUser, 0)

	offset, limit := paginationx.Parse(r.URL.Query())

	// get total authors
	err = config.DB.Model(&model.SpaceUser{}).Where("space_id = ?", authCtx.SpaceID).Count(&result.Total).Limit(limit).Offset(offset).Find(&spaceUsers).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	uIDs := make([]string, 0)

	for _, spaceUser := range spaceUsers {
		uIDs = append(uIDs, spaceUser.UserID)
	}

	// get users details from zitadel
	zitadelUsers, _ := zitadel.GetOrganisationUsers(viper.GetString("ZITADEL_PERSONAL_ACCESS_TOKEN"), authCtx.OrganisationID, uIDs)

	for _, zitadelUser := range zitadelUsers {
		authors = append(authors, model.Author{
			ID:          zitadelUser.ID,
			DisplayName: zitadelUser.Human.Profile.DisplayName,
			FirstName:   zitadelUser.Human.Profile.FirstName,
			LastName:    zitadelUser.Human.Profile.LastName,
		})
	}

	result.Nodes = authors

	renderx.JSON(w, http.StatusOK, result)
}
