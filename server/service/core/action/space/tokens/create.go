package tokens

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

func create(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	spaceToken := &spaceToken{}
	err = json.NewDecoder(r.Body).Decode(&spaceToken)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(spaceToken)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	space := &model.Space{}
	//check if user is part of space or not
	err = config.DB.Model(&model.Space{}).Where(&model.Space{
		Base: config.Base{
			ID: authCtx.SpaceID,
		},
	}).First(&space).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	result := &model.SpaceToken{}
	result.Name = spaceToken.Name
	result.Description = spaceToken.Description
	result.SpaceID = authCtx.SpaceID
	result.Token, err = GenerateSecretToken()
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), config.UserContext, authCtx.UserID)).Begin()

	err = tx.Model(&model.SpaceToken{}).Create(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()

	response := map[string]interface{}{
		"token": result.Token,
	}
	renderx.JSON(w, http.StatusOK, response)
}

var MAX_LENGTH int = 60

var charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

func GenerateSecretToken() (string, error) {
	token := make([]byte, MAX_LENGTH)
	_, err := rand.Read(token) // generates random bytes of length MAX_LENGTH
	if err != nil {
		loggerx.Error(err)
		return "", nil
	}
	for i := 0; i < MAX_LENGTH; i++ {
		token[i] = charSet[int(token[i])%len(charSet)]
	}
	return string(token), nil
}
