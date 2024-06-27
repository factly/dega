package zitadel

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

type ZiatdelUser struct {
	User User `json:"user"`
}

type User struct {
	ID       string `json:"id"`
	Human    Human  `json:"human"`
	UserName string `json:"userName"`
}

type Human struct {
	Profile Profile `json:"profile"`
	Email   Email   `json:"email"`
}

type Profile struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DisplayName string `json:"displayName"`
}

type Email struct {
	Email string `json:"email"`
}

func GetUserProfile(token string) User {

	url := viper.GetString("zitadel_protocol") + "://" + viper.GetString("zitadel_domain") + "/auth/v1/users/me"
	method := "GET"

	user := ZiatdelUser{}

	client := &http.Client{}
	req, err := http.NewRequest(method, url, nil)

	if err != nil {
		loggerx.Error(err)
		return user.User
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+getBearerToken(token))

	res, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		return user.User
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return user.User
	}

	err = json.Unmarshal(body, &user)
	if err != nil {
		loggerx.Error(err)
		return user.User
	}

	fmt.Println(string(body))

	return user.User
}
