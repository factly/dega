package event

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// delete - Delete Event by id
// @Summary Delete Event by id
// @Description Delete Event by id
// @Tags Events
// @ID delete-event-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param event_id path string true "Event ID"
// @Success 200
// @Failure 400 {array} string
// @Router  /core/events/{event_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "event_id")
	id, err := strconv.Atoi(eventID)

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

	hukzURL := viper.GetString("hukz_url") + "/events/" + fmt.Sprint(id)

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

	if resp.StatusCode == http.StatusUnprocessableEntity {
		body := map[string]interface{}{}
		_ = json.NewDecoder(resp.Body).Decode(&body)
		renderx.JSON(w, http.StatusUnprocessableEntity, body)
		return
	}

	if resp.StatusCode != http.StatusOK {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
