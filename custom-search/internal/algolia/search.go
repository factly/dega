package algolia

import (
	"errors"
	"strings"

	"github.com/algolia/algoliasearch-client-go/v3/algolia/opt"
)

func Search(query string, limit int, offset int, filters string) ([]map[string]interface{}, error) {
	if index == nil {
		return nil, errors.New("index is nil, please connect to the index first")
	}
	filters = refactorFilters(filters)
	res, err := index.Search(query, opt.HitsPerPage(int(limit)), opt.Offset(int(offset)), opt.Filters(filters), opt.Length(int(limit)))
	if err != nil {
		return nil, err
	}
	return res.Hits, nil
}

func refactorFilters(filters string) string {
	// algolia needs filters key-values to be separated by ':' currently filters are '=' separated so replacing = with :
	filters = strings.TrimPrefix(filters, "AND")
	filters = strings.TrimPrefix(filters, "OR")

	filters = strings.Replace(filters, "=", ":", -1)
	//adding spaces between each pair of filters
	filters = strings.Replace(filters, "AND", " AND ", -1)
	filters = strings.Replace(filters, "OR", " OR ", -1)

	return filters
}
