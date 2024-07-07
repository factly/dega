package tokens

import (
	"context"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/google/uuid"

	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	tID := chi.URLParam(r, "token_id")
	tokenID, err := uuid.Parse(tID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	space := &model.Space{}
	//check if user is part of space or not
	err = config.DB.Model(&model.Space{}).Where(&model.Space{
		Base: config.Base{
			ID: authCtx.SpaceID,
		},
	}).Find(&space).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// check whether the token exists or not
	var token model.SpaceToken
	err = config.DB.Where(&model.SpaceToken{
		Base: config.Base{
			ID: tokenID,
		},
	}).First(&token).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, authCtx.UserID)).Begin()

	//deleting the token
	err = tx.Delete(&token).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusOK, nil)
}
