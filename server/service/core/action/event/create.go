package event

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reflect"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/factly/x/validationx"
	"github.com/spf13/viper"
)

// create - Create Event
// @Summary Create Event
// @Description Create Event
// @Tags Events
// @ID add-event
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Event body event true "Event Object"
// @Success 201 {object} model.Event
// @Failure 400 {array} string
// @Router /core/events [post]
func create(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	event := &event{}

	if err = json.NewDecoder(r.Body).Decode(&event); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	if validationError := validationx.Check(event); validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	// append app and space tag even if not provided
	if err = AddTags(event); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	hukzURL := viper.GetString("hukz_url") + "/events"

	resp, err := requestx.Request("POST", hukzURL, event, map[string]string{
		"X-User": fmt.Sprint(uID),
	})

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if resp.StatusCode == http.StatusUnprocessableEntity {
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	if resp.StatusCode != http.StatusCreated {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var eventRes model.Event
	if err = json.NewDecoder(resp.Body).Decode(&eventRes); err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusCreated, eventRes)
}

func AddTags(event *event) error {
	tags := make(map[string]string)
	if len(event.Tags.RawMessage) > 0 && !reflect.DeepEqual(event.Tags, test.NilJsonb()) {
		err := json.Unmarshal(event.Tags.RawMessage, &tags)
		if err != nil {
			return err
		}
	}

	tags["app"] = "dega"

	bytesArr, err := json.Marshal(tags)
	if err != nil {
		return err
	}
	event.Tags.RawMessage = bytesArr
	return nil
}
