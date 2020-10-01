package format

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// createDefaults - Create Default Formats
// @Summary Create Default Formats
// @Description Create Default Formats
// @Tags Format
// @ID add-default-formats
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 201 {object} model.Format
// @Failure 400 {array} string
// @Router /core/formats/default [post]
func createDefaults(w http.ResponseWriter, r *http.Request) {
	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	jsonFile, err := os.Open("./data/formats.json")
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer jsonFile.Close()

	formats := make([]model.Format, 0)

	byteValue, _ := ioutil.ReadAll(jsonFile)
	json.Unmarshal(byteValue, &formats)

	tx := config.DB.Begin()

	for i := range formats {
		formats[i].SpaceID = uint(sID)
		tx.Model(&model.Format{}).Create(&formats[i])

		err = insertIntoMeili(formats[i])
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, formats)
}
