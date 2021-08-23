package reindex

import (
	"fmt"
	"log"
	"net/http"

	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/meilisearch/meilisearch-go"
)

func space(w http.ResponseWriter, r *http.Request) {

	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	err = util.CheckSpaceKetoPermission("create", uint(oID), uint(uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	res, err := meilisearchx.Client.Search("dega").Search(meilisearch.SearchRequest{
		Filters: "space_id=" + fmt.Sprint(sID),
	})

	if err != nil {
		log.Fatal(err)
	}

	hits := res.Hits

	if len(hits) == 0 {
		renderx.JSON(w, http.StatusOK, nil)
		return
	}

	objectIDs := make([]string, 0)

	for _, hit := range hits {
		obj := hit.(map[string]interface{})
		objectIDs = append(objectIDs, obj["object_id"].(string))

		log.Println("obj['object_id']", obj["object_id"])
	}

	_, err = meilisearchx.Client.Documents("Dega").Deletes(objectIDs)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if err = util.ReindexAllEntities(uint(sID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, hits)
}
