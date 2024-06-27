package reindex

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/google/uuid"
)

func all(w http.ResponseWriter, r *http.Request) {
	orgRole, err := util.GetOrgRoleFromContext(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	if orgRole != "admin" {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	_, err = config.MeilisearchClient.Index("dega").DeleteAllDocuments()
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if err = util.ReindexAllEntities(uuid.Nil); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
