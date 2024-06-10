package reindex

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/meilisearch/meilisearch-go"
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

	uID, err := util.GetUser(r.Context())
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
	space := model.Space{}
	space.ID = uint(sID)

	// err = config.DB.Model(&model.Space{}).First(&space).Error
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.DBError()))
	// 	return
	// }

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

	res, err := meilisearchx.Client.Index("dega").Search("", &meilisearch.SearchRequest{
		Filter: "space_id=" + fmt.Sprint(sID),
		Limit:  100000,
	})

	if err != nil {
		log.Println(err)
	}
	// log.Fatal("=============", res)
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
