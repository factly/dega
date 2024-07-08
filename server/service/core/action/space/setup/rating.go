package setup

import (
	"encoding/json"
	"io"
	"os"

	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Ratings(tx *gorm.DB, sID uuid.UUID) (*gorm.DB, errorx.Message) {
	dataFile := "./data/ratings.json"

	jsonFile, err := os.Open(dataFile)
	if err != nil {
		loggerx.Error(err)
		return tx, errorx.DecodeError()
	}

	defer jsonFile.Close()

	ratings := make([]model.Rating, 0)

	byteValue, _ := io.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &ratings)
	if err != nil {
		loggerx.Error(err)
		return tx, errorx.InternalServerError()
	}

	for i := range ratings {
		ratings[i].SpaceID = sID
		ratings[i].DescriptionHTML, err = util.GetDescriptionHTML(ratings[i].Description)
		if err != nil {
			loggerx.Error(err)
			return tx, errorx.DecodeError()
		}

		ratings[i].Description, err = util.GetJSONDescription(ratings[i].BackgroundColour)
		if err != nil {
			loggerx.Error(err)
			return tx, errorx.DecodeError()
		}
	}

	err = tx.Model(&model.Rating{}).Create(&ratings).Error

	if err != nil {
		loggerx.Error(err)
		return tx, errorx.InternalServerError()
	}
	return tx, errorx.Message{}

}
