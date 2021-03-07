package util

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/middlewarex"
	"github.com/spf13/viper"
)

// PodcastPermission checks weather organisation has podcast permission
func PodcastPermission(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if viper.GetBool("create_super_organisation") {
			sID, err := middlewarex.GetSpace(r.Context())
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			permission := model.SpacePermission{}
			err = config.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
				SpaceID: uint(sID),
			}).First(&permission).Error

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			if !permission.Podcast {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
		}

		h.ServeHTTP(w, r)
	})
}
