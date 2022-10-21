package reindex

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/util"
	httpx "github.com/factly/dega-server/util/http"
	search "github.com/factly/dega-server/util/search-service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

func space(w http.ResponseWriter, r *http.Request) {
	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
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

	req, err := http.NewRequest(http.MethodGet, viper.GetString("kavach_url")+fmt.Sprintf("/util/space/%d/getOrganisation", sID), nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	req.Header.Set("X-User", fmt.Sprintf("%d", uID))
	client := httpx.CustomHttpClient()
	response, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	defer response.Body.Close()
	responseBody := map[string]interface{}{}
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	oID := int(responseBody["organisation_id"].(float64))

	isAdmin, err := util.CheckAdmin(uint(oID), uint(uID))
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

	searchService := search.GetSearchService()
	hits, err := searchService.GetAllDocumentsBySpace(uint(sID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if len(hits) > 0 {
		objectIDs := make([]string, 0)
		for _, hit := range hits {
			obj := hit.(map[string]interface{})
			objectIDs = append(objectIDs, obj["object_id"].(string))
		}

		err = searchService.BatchDelete(objectIDs)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	if err = util.ReindexAllEntities(uint(sID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
