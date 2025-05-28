package setup

import (
	"encoding/json"
	"io"
	"os"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Formats(tx *gorm.DB, sID uuid.UUID) (*gorm.DB, errorx.Message) {
	dataFile := "./data/formats.json"

	jsonFile, err := os.Open(dataFile)
	if err != nil {
		loggerx.Error(err)
		return tx, errorx.DecodeError()
	}

	defer jsonFile.Close()

	formats := make([]model.Format, 0)

	byteValue, _ := io.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &formats)
	if err != nil {
		loggerx.Error(err)
		return tx, errorx.InternalServerError()
	}

	for _, f := range formats {
		format := model.Format{
			Name:        f.Name,
			Slug:        f.Slug,
			Description: f.Description,
			SpaceID:     sID,
		}
		formats = append(formats, format)
	}

	err = tx.Model(&model.Format{}).Create(&formats).Error
	if err != nil {
		loggerx.Error(err)
		return tx, errorx.InternalServerError()
	}

	return tx, errorx.Message{}
}
