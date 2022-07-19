package format

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
)

// DataFile default json data file
var DataFile = "./data/formats.json"

// createDefaults - Create Default Formats
// @Summary Create Default Formats
// @Description Create Default Formats
// @Tags Format
// @ID add-default-formats
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 201 {object} paging
// @Failure 400 {array} string
// @Router /core/formats/default [post]
func createDefaults(w http.ResponseWriter, r *http.Request) {
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

	formats := make([]model.Format, 0)

	byteValue, _ := ioutil.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &formats)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	spacePermission := &model.SpacePermission{}
	spacePermission.ID = uint(sID)
	err = config.DB.Model(&model.SpacePermission{}).First(&spacePermission).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	for i := range formats {
		if formats[i].Name == "Fact Check" && !spacePermission.FactCheck {
			break
		}
		formats[i].SpaceID = uint(sID)
		tx.Model(&model.Format{}).FirstOrCreate(&formats[i], &formats[i])
		if config.SearchEnabled() {
			_ = insertIntoMeili(formats[i])
		}
	}

	result := paging{}
	result.Nodes = formats
	result.Total = int64(len(formats))

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, result)
}
