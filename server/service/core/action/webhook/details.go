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

// details - Get webhook by id
// @Summary Show a webhook by id
// @Description Get webhook by ID
// @Tags Webhooks
// @ID get-webhook-by-id
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param webhook_id path string true "Webhook ID"
// @Success 200 {object} model.Webhook
// @Router /core/webhooks/{webhook_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	webhookID := chi.URLParam(r, "webhook_id")
	id, err := strconv.Atoi(webhookID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	hukzURL := viper.GetString("hukz_url") + "/webhooks/" + fmt.Sprint(id)

	resp, err := requestx.Request("GET", hukzURL, nil, map[string]string{
		"X-User": authCtx.UserID,
	})
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if resp.StatusCode == http.StatusNotFound {
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if resp.StatusCode > 500 {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var webhookRes model.Webhook

	if err = json.NewDecoder(resp.Body).Decode(&webhookRes); err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, webhookRes)

}
