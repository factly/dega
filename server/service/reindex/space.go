package reindex

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/meilisearch/meilisearch-go"
)

func space(w http.ResponseWriter, r *http.Request) {
	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	space := model.Space{}
	space.ID = uint(sID)

	err = config.DB.Model(&model.Space{}).First(&space).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	isAdmin, err := util.CheckAdmin(space.OrganisationID, uint(uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	if !isAdmin {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	res, err := meilisearchx.Client.Index("dega").Search("", &meilisearch.SearchRequest{
		Filter: "space_id=" + fmt.Sprint(sID),
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

			_, err = meilisearchx.Client.Index("dega").DeleteDocuments(objectIDs)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	if err = util.ReindexAllEntities(uint(sID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
