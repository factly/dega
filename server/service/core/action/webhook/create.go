package webhook

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reflect"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/test"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/factly/x/validationx"
	"github.com/spf13/viper"
)

// create - Create Webhook
// @Summary Create Webhook
// @Description Create Webhook
// @Tags Webhooks
// @ID add-webhook
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Webhook body webhook true "Webhook Object"
// @Success 201 {object} model.Webhook
// @Failure 400 {array} string
// @Router /core/webhooks [post]
func create(w http.ResponseWriter, r *http.Request) {
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

	hukzURL := viper.GetString("hukz_url") + "/webhooks"

	resp, err := requestx.Request("POST", hukzURL, webhook, map[string]string{
		"X-User": fmt.Sprint(uID),
	})

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
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

	renderx.JSON(w, http.StatusCreated, webhookRes)
}

func AddTags(webhook *webhook, sID int) error {
	tags := make(map[string]string)
	if len(webhook.Tags.RawMessage) > 0 && !reflect.DeepEqual(webhook.Tags, test.NilJsonb()) {
		err := json.Unmarshal(webhook.Tags.RawMessage, &tags)
		if err != nil {
			return err
		}
	}

	tags["app"] = "dega"
	tags["space"] = fmt.Sprint(sID)

	bytesArr, err := json.Marshal(tags)
	if err != nil {
		return err
	}
	webhook.Tags.RawMessage = bytesArr
	return nil
}
