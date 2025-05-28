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

type policyReq struct {
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Permissions []permission `json:"permissions"`
	Users       []string     `json:"users"`
}

type permission struct {
	Actions  []string `json:"actions"`
	Resource string   `json:"resource"`
}

func Policies(tx *gorm.DB, sID uuid.UUID) (*gorm.DB, errorx.Message) {
	dataFile := "./data/policies.json"

	jsonFile, err := os.Open(dataFile)
	if err != nil {
		loggerx.Error(err)
		return tx, errorx.DecodeError()
	}

	defer jsonFile.Close()

	policies := make([]policyReq, 0)

	byteValue, _ := io.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &policies)
	if err != nil {
		loggerx.Error(err)
		return tx, errorx.InternalServerError()
	}

	for _, p := range policies {

		policy := model.Policy{
			Name:        p.Name,
			Description: p.Description,
			SpaceID:     sID,
		}

		err = tx.Model(&model.Policy{}).Create(&policy).Error
		if err != nil {
			loggerx.Error(err)
			return tx, errorx.InternalServerError()
		}

		permissions := make([]model.Permission, 0)

		for _, permission := range p.Permissions {
			for _, action := range permission.Actions {
				policyPermission := model.Permission{
					PolicyID: policy.ID,
					Action:   action,
					Resource: permission.Resource,
				}
				permissions = append(permissions, policyPermission)
			}
		}

		err = tx.Model(&model.Permission{}).Create(&permissions).Error

		if err != nil {
			loggerx.Error(err)
			return tx, errorx.InternalServerError()
		}
	}

	return tx, errorx.Message{}

}
