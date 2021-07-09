package webhook

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// delete - Delete webhook by id
// @Summary Delete webhook by id
// @Description Delete webhook by id
// @Tags Webhooks
// @ID delete-webhook-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param webhook_id path string true "Webhook ID"
// @Success 200
// @Failure 400 {array} string
// @Router  /core/webhooks/{webhook_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	webhookID := chi.URLParam(r, "webhook_id")
	id, err := strconv.Atoi(webhookID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	hukzURL := viper.GetString("hukz_url") + "/webhooks/" + fmt.Sprint(id)

	resp, err := requestx.Request("DELETE", hukzURL, nil, map[string]string{
		"X-User": fmt.Sprint(uID),
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

	renderx.JSON(w, http.StatusOK, nil)
}
