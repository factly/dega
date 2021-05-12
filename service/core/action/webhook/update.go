package webhook

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// update - Update webhook by id
// @Summary Update a webhook by id
// @Description Update webhook by ID
// @Tags Webhooks
// @ID update-webhook-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param webhook_id path string true "Webhook ID"
// @Param Webhook body webhook false "Webhook Object"
// @Success 200 {object} model.Webhook
// @Router /core/webhooks/{webhook_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
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

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	webhook := &webhook{}

	if err = json.NewDecoder(r.Body).Decode(&webhook); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	if validationError := validationx.Check(webhook); validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	// append app and space tag even if not provided
	if err = AddTags(webhook, sID); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	hukzURL := viper.GetString("hukz_url") + "/webhooks/" + fmt.Sprint(id)

	resp, err := requestx.Request("PUT", hukzURL, webhook, map[string]string{
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

	var webhookRes model.Webhook

	if err = json.NewDecoder(resp.Body).Decode(&webhookRes); err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, webhookRes)
}
