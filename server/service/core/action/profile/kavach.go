package profile

import (
	"encoding/json"
	"net/http"

	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/spf13/viper"
)

func redirectToKavach(w http.ResponseWriter, r *http.Request) {

	header := r.Header

	url := viper.GetString("kavach_url") + "/profile"

	req, _ := http.NewRequest(r.Method, url, r.Body)

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-USer", header.Get("X-User"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	defer resp.Body.Close()

	var res interface{}
	err = json.NewDecoder(resp.Body).Decode(&res)

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	renderx.JSON(w, resp.StatusCode, res)
}
