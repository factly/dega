package webhook

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/spf13/viper"
)

type paging struct {
	Total int64           `json:"total"`
	Nodes []model.Webhook `json:"nodes"`
}

// list - Get all webhooks
// @Summary Show all webhooks
// @Description Get all webhooks
// @Tags Webhooks
// @ID get-all-webhooks
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /core/webhooks [get]
func list(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	hukzURL := viper.GetString("hukz_url") + "/webhooks/space/" + authCtx.SpaceID.String() + "/?tag=app:dega&tag=space:" + authCtx.SpaceID.String() + "&limit=" + r.URL.Query().Get("limit") + "&page=" + r.URL.Query().Get("page")

	resp, err := requestx.Request("GET", hukzURL, nil, map[string]string{
		"X-User": authCtx.UserID,
	})
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if resp.StatusCode != http.StatusOK {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var webhooksPaging paging

	if err = json.NewDecoder(resp.Body).Decode(&webhooksPaging); err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, webhooksPaging)
}
