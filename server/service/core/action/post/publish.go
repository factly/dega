package post

import (
	"net/http"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/loggerx"
)

func Publish() {

	time := time.Now()

	posts := make([]model.Post, 0)
	config.DB.Model(&model.Post{}).Where("status = ? and published_date <= ?", "future", time).Find(&posts)

	for _, post := range posts {
		config.DB.Model(&model.Post{}).Where("id = ?", post.ID).Updates(map[string]interface{}{"status": "publish"})

		r := http.Request{}

		r.Header.Add("X-User", post.CreatedByID)

		if util.CheckNats() {
			if util.CheckWebhookEvent("post.publish", post.SpaceID.String(), &r) {
				if err := util.NC.Publish("post.publish", post); err != nil {
					loggerx.Error(err)
					return
				}
			}
		}
	}
}
