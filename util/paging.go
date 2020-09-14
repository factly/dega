package util

// Parse pagination
func Parse(limit *int, page *int) (int, int) {
	pageLimit := 10
	pageNo := 1

	if limit != nil {
		pageLimit = *limit
	}
	if page != nil {
		pageNo = *page
	}

	return pageLimit * (pageNo - 1), pageNo
}
