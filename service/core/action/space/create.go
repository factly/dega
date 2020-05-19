package space

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

func create(w http.ResponseWriter, r *http.Request) {
	space := &model.Space{}

	if r.Header.Get("X-User") == "" {
		return
	}

	json.NewDecoder(r.Body).Decode(&space)

	req, err := http.NewRequest("GET", os.Getenv("KAVACH_URL")+"/organizations/"+strconv.Itoa(space.OrganisationID), nil)
	req.Header.Set("X-User", r.Header.Get("X-User"))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	org := orgWithSpace{}

	err = json.Unmarshal(body, &org)

	if org.Permission.Role != "owner" {
		return
	}

	err = config.DB.Create(&space).Error

	if err != nil {
		fmt.Println(err)
		return
	}

	render.JSON(w, http.StatusCreated, space)
}
