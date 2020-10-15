package meta

import (
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// details - Get meta info
// @Summary Get meta info
// @Description Get meta info
// @Tags Meta
// @ID get-meta-info
// @Produce  json
// @Param url query string true "URL"
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} metadata
// @Router /core/meta [get]
func details(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	if url == "" {
		errorx.Render(w, errorx.Parser(errorx.Message{
			Code:    http.StatusBadRequest,
			Message: "please pass url query parameter",
		}))
		return
	}

	response, err := http.Get(url)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer response.Body.Close()

	doc, err := goquery.NewDocumentFromReader(response.Body)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result := metadata{}
	result.Success = 0

	doc.Find("meta").Each(func(i int, s *goquery.Selection) {
		name, _ := s.Attr("name")
		property, _ := s.Attr("property")
		content, _ := s.Attr("content")

		if strings.Contains(name, "title") {
			result.Meta.Title = content
			result.Success = 1
		} else if strings.Contains(name, "description") {
			result.Meta.Description = content
			result.Success = 1
		} else if property == "og:image" {
			result.Meta.Image = map[string]interface{}{
				"url": content,
			}
			result.Success = 1
		} else if strings.Contains(property, "site_name") {
			result.Meta.SiteName = content
			result.Success = 1
		}
	})

	renderx.JSON(w, http.StatusOK, result)
}
