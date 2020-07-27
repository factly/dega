package medium

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factcheckModel "github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
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

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	mediumID := chi.URLParam(r, "medium_id")
	id, err := strconv.Atoi(mediumID)

	if err != nil {
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
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var cnt int
	config.DB.Model(&model.Post{}).Where(&model.Post{
		SpaceID:          uint(sID),
		FeaturedMediumID: uint(id),
	}).Count(&cnt)

	if cnt != 0 {
		errorx.Render(w, errorx.Parser(util.CannotDeleteError()))
		return
	}

	var medID uint = uint(id)
	config.DB.Model(&model.Space{}).Where(&model.Space{
		LogoID: &medID,
	}).Or(&model.Space{
		LogoMobileID: &medID,
	}).Or(&model.Space{
		FavIconID: &medID,
	}).Or(&model.Space{
		MobileIconID: &medID,
	}).Count(&cnt)

	if cnt != 0 {
		errorx.Render(w, errorx.Parser(util.CannotDeleteError()))
		return
	}

	config.DB.Model(&factcheckModel.Rating{}).Where(&factcheckModel.Rating{
		SpaceID:  uint(sID),
		MediumID: uint(id),
	}).Count(&cnt)

	if cnt != 0 {
		errorx.Render(w, errorx.Parser(util.CannotDeleteError()))
		return
	}

	config.DB.Model(&factcheckModel.Claimant{}).Where(&factcheckModel.Claimant{
		SpaceID:  uint(sID),
		MediumID: uint(id),
	}).Count(&cnt)

	if cnt != 0 {
		errorx.Render(w, errorx.Parser(util.CannotDeleteError()))
		return
	}

	config.DB.Delete(&result)

	renderx.JSON(w, http.StatusOK, nil)
}
