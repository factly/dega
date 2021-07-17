package medium

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete medium by id
// @Summary Delete a medium
// @Description Delete medium by ID
// @Tags Medium
// @ID delete-medium-by-id
// @Param X-User header string true "User ID"
// @Param medium_id path string true "Medium ID"
// @Param X-Space header string true "Space ID"
// @Success 200
// @Router /core/media/{medium_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	mediumID := chi.URLParam(r, "medium_id")
	id, err := strconv.Atoi(mediumID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Medium{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Medium{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	uintID := uint(id)

	// check if medium is associated with posts
	var totAssociated int64
	config.DB.Model(&model.Post{}).Where(&model.Post{
		FeaturedMediumID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with post"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("medium", "post")))
		return
	}

	// check if medium is associated with categories
	config.DB.Model(&model.Category{}).Where(&model.Category{
		MediumID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with category"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("medium", "category")))
		return
	}

	// check if medium is associated with spaces
	config.DB.Model(&model.Space{}).Where(&model.Space{
		LogoID: &uintID,
	}).Or(&model.Space{
		LogoMobileID: &uintID,
	}).Or(&model.Space{
		FavIconID: &uintID,
	}).Or(&model.Space{
		MobileIconID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with space"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("medium", "space")))
		return
	}

	// check if medium is associated with ratings
	config.DB.Model(&factCheckModel.Rating{}).Where(&factCheckModel.Rating{
		MediumID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with rating"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("medium", "rating")))
		return
	}

	// check if medium is associated with claimants
	config.DB.Model(&factCheckModel.Claimant{}).Where(&factCheckModel.Claimant{
		MediumID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with claimant"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("medium", "claimant")))
		return
	}

	tx := config.DB.Begin()
	tx.Delete(&result)

	if config.SearchEnabled() {
		_ = meilisearchx.DeleteDocument("dega", result.ID, "medium")
	}

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("media.deleted", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, nil)
}
