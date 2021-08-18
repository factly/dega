package kavach

import (
	"encoding/json"
	"net/http"

	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// Router - Group of category router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Route("/profile", func(r chi.Router) {
		r.Get("/", redirectToKavach)
		r.Put("/", redirectToKavach)
	})

	r.Route("/medium", func(r chi.Router) {
		r.Get("/", redirectToKavach)
		r.Post("/", redirectToKavach)
	})

	return r
}

func redirectToKavach(w http.ResponseWriter, r *http.Request) {

	header := r.Header

	url := viper.GetString("kavach_url") + r.URL.Path

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