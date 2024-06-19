package format

import (
	"net/http"
)

func Feeds(w http.ResponseWriter, r *http.Request) {
	// uID, err := util.GetUser(r.Context())
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }
	// spaceID := chi.URLParam(r, "space_id")
	// sID, err := strconv.Atoi(spaceID)
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.InvalidID()))
	// 	return
	// }

	// orgID, err := util.GetOrganisationIDfromSpaceID(uint(sID), uint(uID))
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
	// 	return
	// }

	// offset, limit := paginationx.Parse(r.URL.Query())
	// sort := r.URL.Query().Get("sort")
	// if sort != "asc" {
	// 	sort = "desc"
	// }

	// slugs := chi.URLParam(r, "slugs")
	// formatSlugs := strings.Split(slugs, ",")

	// space := model.Space{}

	// formatIDs := make([]uint, 0)
	// formatList := make([]model.Format, 0)
	// config.DB.Model(&model.Format{}).Where("slug IN (?)", formatSlugs).Find(&formatList)
	// for _, each := range formatList {
	// 	formatIDs = append(formatIDs, each.ID)
	// }

	// feed := post.GetFeed(space)

	// postList := make([]model.Post, 0)
	// config.DB.Model(&model.Post{}).Where(&model.Post{
	// 	Status:  "publish",
	// 	SpaceID: uint(sID),
	// }).Where("is_page = ?", false).Where("format_id IN (?)", formatIDs).Order("created_at " + sort).Offset(offset).Limit(limit).Find(&postList)

	// feed.Items = post.GetItemsList(postList, space)

	// if err := feed.WriteRss(w); err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
	// 	return
	// }
}
