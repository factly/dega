package space

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/x/middlewarex"
	"github.com/spf13/viper"

	//	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get space by id
// @Summary Show a space by id
// @Description Get space by ID
// @Tags Space
// @ID get-space-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param space_id path string true "Space ID"
// @Success 200 {object} model.Space
// @Router /core/spaces/{space_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	spaceID := chi.URLParam(r, "space_id")
	//id, err := strconv.Atoi(spaceID)

	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.InvalidID()))
	// 	return
	// }
	//** HARDCODED organisation id need x-package util to get organisation id , given space id and uid
	req, err := http.NewRequest("GET", viper.GetString("kavach_url")+"/organisations/1/applications/"+viper.GetString("dega_application_id")+"/spaces/"+spaceID, nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	result := &model.Space{}
	err = json.NewDecoder(resp.Body).Decode(result)
	if err != nil {
		loggerx.Error(err)
		return
	}

	//result := &model.Space{}

	//result.ID = uint(id)

	//err = config.DB.Model(&model.Space{}).Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").First(&result).Error

	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
	// 	return
	// }

	renderx.JSON(w, http.StatusOK, result)
}
