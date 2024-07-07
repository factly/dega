package post

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

func PublishScheduledPosts() {
	posts := make([]model.Post, 0)

	currentTime := time.Now()

	config.DB.Model(&model.Post{}).Where("published_date > ? and published_date < ?", currentTime.Add(time.Minute), currentTime.Add(-5*time.Minute)).Where("status = ?", "ready").Find(&posts)

	for {
		time.Sleep(1 * time.Minute) // Check every minute
		now := time.Now()

		for i, post := range posts {
			if post.PublishedDate.Before(now) {
				config.DB.Model(&model.Post{}).Where("id = ?", post.ID).Update("status", "publish")
				posts = append(posts[:i], posts[i+1:]...)
			}
		}
	}
}
