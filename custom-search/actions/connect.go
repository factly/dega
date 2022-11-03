package actions

import (
	"encoding/json"
	"net/http"

	"github.com/factly/custom-search/internal/algolia"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

func connect(w http.ResponseWriter, r *http.Request) {
	config := new(algolia.Config)
	err := json.NewDecoder(r.Body).Decode(&config)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	apiKeys := make(map[string]string)
	apiKeys["write_api_key"] = r.Header.Get("write_api_key")
	apiKeys["read_api_key"] = r.Header.Get("read_api_key")

	config.APIkeys = apiKeys
	err = algolia.Connect(config)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
		return
	}

	renderx.JSON(w, http.StatusAccepted, map[string]interface{}{
		"message": "successfully connected to index",
	})
}
