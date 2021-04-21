package episode

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64         `json:"total"`
	Nodes []episodeData `json:"nodes"`
}

// list - Get all episodes
// @Summary Show all episodes
// @Description Get all episodes
// @Tags Episode
// @ID get-all-episodes
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param q query string false "Query"
// @Param sort query string false "Sort"
// @Success 200 {object} paging
// @Router /podcast/episodes [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")

	filteredEpisodeIDs := make([]uint, 0)

	result := paging{}
	result.Nodes = make([]episodeData, 0)

	if searchQuery != "" {

		filters := fmt.Sprint("space_id=", sID)
		var hits []interface{}

		hits, err = meilisearchx.SearchWithQuery("dega", searchQuery, filters, "episode")

		if err != nil {
			loggerx.Error(err)
			renderx.JSON(w, http.StatusOK, result)
			return
		}

		filteredEpisodeIDs = meilisearchx.GetIDArray(hits)
		if len(filteredEpisodeIDs) == 0 {
			renderx.JSON(w, http.StatusOK, result)
			return
		}
	}

	if sort != "asc" {
		sort = "desc"
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	tx := config.DB.Model(&model.Episode{}).Preload("Medium").Preload("Podcast").Preload("Podcast.Medium").Where(&model.Episode{
		SpaceID: uint(sID),
	}).Order("created_at " + sort)

	episodes := make([]model.Episode, 0)
	if len(filteredEpisodeIDs) > 0 {
		err = tx.Where(filteredEpisodeIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&episodes).Error
	} else {
		err = tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&episodes).Error
	}
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	episodeIDs := make([]uint, 0)
	for _, each := range episodes {
		episodeIDs = append(episodeIDs, each.ID)
	}

	// Adding authors in response
	authorMap, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	authorEpisodes := make([]model.EpisodeAuthor, 0)
	config.DB.Model(&model.EpisodeAuthor{}).Where("episode_id IN (?)", episodeIDs).Find(&authorEpisodes)

	episodeAuthorMap := make(map[uint][]coreModel.Author)
	for _, authEpi := range authorEpisodes {
		if _, found := episodeAuthorMap[authEpi.EpisodeID]; !found {
			episodeAuthorMap[authEpi.EpisodeID] = make([]coreModel.Author, 0)
		}
		episodeAuthorMap[authEpi.EpisodeID] = append(episodeAuthorMap[authEpi.EpisodeID], authorMap[fmt.Sprint(authEpi.AuthorID)])
	}

	for _, each := range episodes {
		data := episodeData{}
		data.Episode = each
		data.Authors = episodeAuthorMap[each.ID]
		result.Nodes = append(result.Nodes, data)
	}

	renderx.JSON(w, http.StatusOK, result)
}
