package reindex

import (
	"log"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/meilisearch/meilisearch-go"
)

func space(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	orgRole := authCtx.OrgRole

	space := model.Space{}
	space.ID = authCtx.SpaceID

	err = config.DB.Model(&model.Space{}).First(&space).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	if orgRole != "admin" {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	res, err := config.MeilisearchClient.Index("dega").Search("", &meilisearch.SearchRequest{
		Filter: "space_id=" + authCtx.SpaceID.String(),
		Limit:  100000,
	})

	if err != nil {
		log.Println(err)
	}
	if res != nil {
		hits := res.Hits
		if len(hits) > 0 {

			objectIDs := make([]string, 0)

			for _, hit := range hits {
				obj := hit.(map[string]interface{})
				objectIDs = append(objectIDs, obj["object_id"].(string))
			}

			_, err = config.MeilisearchClient.Index("dega").DeleteDocuments(objectIDs)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	if err = util.ReindexAllEntities(authCtx.SpaceID); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
