package user

import (
	"net/http"

	"github.com/factly/dega-server/util/zitadel"
	"github.com/factly/x/renderx"
)

func details(w http.ResponseWriter, r *http.Request) {

	user := zitadel.GetUserProfile(r.Header.Get("authorization"))

	renderx.JSON(w, http.StatusOK, user)

}
