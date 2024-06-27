package webhook

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

type logPaging struct {
	Total int64              `json:"total"`
	Nodes []model.WebhookLog `json:"nodes"`
}

// list - Get all webhooks logs
// @Summary Show all webhooks logs
// @Description Get all webhooks logs
// @Tags Webhooks
// @ID get-all-webhooks-logs
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /core/webhooks/logs [get]
func logs(w http.ResponseWriter, r *http.Request) {
	webhookID := chi.URLParam(r, "webhook_id")
	wID, err := strconv.Atoi(webhookID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	hukzURL := viper.GetString("hukz_url") + "/webhooks/space/" + fmt.Sprint(sID) + "/webhook/" + fmt.Sprint(wID) + "/logs?tag=app:dega&tag=space:" + fmt.Sprint(sID) + "&limit=" + r.URL.Query().Get("limit") + "&page=" + r.URL.Query().Get("page")

	resp, err := requestx.Request("GET", hukzURL, nil, map[string]string{
		"X-User": fmt.Sprint(uID),
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

	var webhooksPaging logPaging

	if err = json.NewDecoder(resp.Body).Decode(&webhooksPaging); err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, webhooksPaging)
}
