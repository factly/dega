package event

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/spf13/viper"
)

// DataFile default json data file
var DataFile = "./data/events.json"

// create - Create default Events
// @Summary Create default Events
// @Description Create default Events
// @Tags Events
// @ID add-default-events
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 201 {object} model.Event
// @Failure 400 {array} string
// @Router /core/events/default [post]
func defaults(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	jsonFile, err := os.Open(DataFile)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer jsonFile.Close()

	events := make([]event, 0)

	byteValue, _ := ioutil.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &events)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	eventsResp := make([]model.Event, 0)
	for i := range events {
		if err = AddTags(&events[i], sID); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		hukzURL := viper.GetString("hukz_url") + "/events"

		resp, err := requestx.Request("POST", hukzURL, events[i], map[string]string{
			"X-User": fmt.Sprint(uID),
		})

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		if resp.StatusCode == http.StatusUnprocessableEntity {
			continue
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
		eventsResp = append(eventsResp, eventRes)

	}
	renderx.JSON(w, http.StatusCreated, eventsResp)
}
