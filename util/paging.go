package util

// Parse pagination
func Parse(limit *int, page *int) (int, int) {
	pageLimit := 0
	pageNo := 10

	if limit != nil {
		pageLimit = *limit
	}
	if page != nil {
		pageNo = *page
	}

	return pageLimit, pageNo
}
