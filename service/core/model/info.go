package model

type PostCount struct {
	Status string `json:"status"`
	Slug   string `json:"slug"`
	Count  int64  `json:"count"`
}

type Info struct {
	Categories int64       `gorm:"column:categories" json:"categories"`
	Tags       int64       `gorm:"column:tags" json:"tags"`
	Posts      []PostCount `gorm:"column:posts" json:"posts"`
	Podcasts   int64       `gorm:"column:podcasts" json:"podcasts"`
	Episodes   int64       `gorm:"column:episodes" json:"episodes"`
}
