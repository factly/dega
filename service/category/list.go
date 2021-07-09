package category

import (
	"net/http"

	"github.com/factly/dega-vito/config"
	"github.com/factly/dega-vito/model"
	"github.com/factly/dega-vito/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
)

func list(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	categoryList := make([]model.Category, 0)

	offset, limit := paginationx.Parse(r.URL.Query())
	sort := r.URL.Query().Get("sort")

	if sort != "asc" {
		sort = "desc"
	}

	err = config.DB.Model(&model.Category{}).Preload("Medium").Where(&model.Category{
		SpaceID: uint(sID),
	}).Order("created_at " + sort).Offset(offset).Limit(limit).Find(&categoryList).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	err = util.Template.ExecuteTemplate(w, "categorylist.gohtml", categoryList)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}
