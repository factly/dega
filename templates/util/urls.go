package util

import (
	"fmt"
	"net/url"
	"strconv"
)

// GetNextPrevURL: get next and prev url for paiganation
func GetNextPrevURL(url url.URL, limit int) (string, string) {
	page, _ := strconv.Atoi(url.Query().Get("page")) // page number
	if page == 0 {
		page = 1
	}

	nextURL := fmt.Sprint(url.Path, "?limit=", limit, "&page=", page+1)
	var prevURL string
	if page > 1 {
		prevURL = fmt.Sprint(url.Path, "?limit=", limit, "&page=", page-1)
	} else {
		prevURL = fmt.Sprint(url.Path, "?limit=", limit, "&page=", page)
	}

	return nextURL, prevURL
}
