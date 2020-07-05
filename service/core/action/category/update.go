package category

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/errors"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// update - Update category by id
// @Summary Update a category by id
// @Description Update category by ID
// @Tags Category
// @ID update-category-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param category_id path string true "Category ID"
// @Param X-Space header string true "Space ID"
// @Param Category body category false "Category"
// @Success 200 {object} model.Category
// @Router /core/categories/{category_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Render(w, errors.Parser(errors.InternalServerError()), 500)
		return
	}

	categoryID := chi.URLParam(r, "category_id")
	id, err := strconv.Atoi(categoryID)

	if err != nil {
		errors.Render(w, errors.Parser(errors.InvalidID()), 404)
		return

	}

	category := &category{}
	json.NewDecoder(r.Body).Decode(&category)

	result := &model.Category{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Category{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		errors.Render(w, errors.Parser(errors.DBError()), 404)
		return
	}

	var categorySlug string

	if result.Slug == category.Slug {
		categorySlug = result.Slug
	} else if category.Slug != "" && slug.Check(category.Slug) {
		categorySlug = slug.Approve(category.Slug, sID, config.DB.NewScope(&model.Category{}).TableName())
	} else {
		categorySlug = slug.Approve(slug.Make(category.Name), sID, config.DB.NewScope(&model.Category{}).TableName())
	}

	config.DB.Model(&result).Updates(model.Category{
		Name:        category.Name,
		Slug:        categorySlug,
		Description: category.Description,
		ParentID:    category.ParentID,
		MediumID:    category.MediumID,
	}).Preload("Medium").First(&result)

	renderx.JSON(w, http.StatusOK, result)
}
