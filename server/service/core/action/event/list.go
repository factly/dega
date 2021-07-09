package event

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/spf13/viper"
)

type paging struct {
	Total int64         `json:"total"`
	Nodes []model.Event `json:"nodes"`
}

// list - Get all events
// @Summary Show all events
// @Description Get all events
// @Tags Events
// @ID get-all-events
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /core/events [get]
func list(w http.ResponseWriter, r *http.Request) {
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

	hukzURL := viper.GetString("hukz_url") + "/events?tag=app:dega&limit=" + r.URL.Query().Get("limit") + "&page=" + r.URL.Query().Get("page") + "&tag=space:" + fmt.Sprint(sID)

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

	var eventsPaging paging

	if err = json.NewDecoder(resp.Body).Decode(&eventsPaging); err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, eventsPaging)

}
