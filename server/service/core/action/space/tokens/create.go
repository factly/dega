package tokens

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/google/uuid"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

func create(w http.ResponseWriter, r *http.Request) {
	userID, err := util.GetUser(r.Context())
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	sID := chi.URLParam(r, "space_id")
	spaceID, err := uuid.Parse(sID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	spaceToken := &model.SpaceToken{}
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
			ID: spaceID,
		},
	}).First(&space).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	spaceToken = &model.SpaceToken{}

	spaceToken.SpaceID = spaceID
	spaceToken.Token, err = GenerateSecretToken()
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	spaceToken.CreatedByID = userID
	err = config.DB.Model(&model.SpaceToken{}).Create(&spaceToken).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	response := map[string]interface{}{
		"token": spaceToken.Token,
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
