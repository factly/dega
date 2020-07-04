package author

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/factly/dega-server/service/core/model"
)

// Mapper map user with id
func Mapper(oID int, uID int) map[string]model.Author {
	userMap := make(map[string]model.Author)
	url := fmt.Sprint(os.Getenv("KAVACH_URL"), "/organizations/", oID, "/users")

	req, err := http.NewRequest("GET", url, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User", fmt.Sprint(uID))
	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return userMap
	}

	defer resp.Body.Close()

	users := []model.Author{}
	json.NewDecoder(resp.Body).Decode(&users)

	for _, u := range users {
		userMap[fmt.Sprint(u.ID)] = u
	}

	return userMap
}
