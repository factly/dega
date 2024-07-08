package setup

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"reflect"

	"github.com/factly/dega-server/test"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/requestx"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

type event struct {
	Name  string         `json:"name"`
	Event string         `json:"event"`
	Tags  postgres.Jsonb `json:"tags"`
}

func Events(tx *gorm.DB, uID string) (*gorm.DB, errorx.Message) {
	dataFile := "./data/events.json"

	jsonFile, err := os.Open(dataFile)
	if err != nil {
		loggerx.Error(err)
		return tx, errorx.DecodeError()
	}

	defer jsonFile.Close()

	events := make([]event, 0)

	byteValue, _ := io.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &events)
	if err != nil {
		loggerx.Error(err)
		return tx, errorx.InternalServerError()

	}

	for i := range events {
		if err = addTags(&events[i]); err != nil {
			loggerx.Error(err)
			return tx, errorx.InternalServerError()
		}

		hukzURL := viper.GetString("hukz_url") + "/events"

		resp, err := requestx.Request("POST", hukzURL, events[i], map[string]string{
			"X-User": uID,
		})

		if err != nil {
			loggerx.Error(err)
			return tx, errorx.InternalServerError()
		}

		if resp.StatusCode == http.StatusUnprocessableEntity {
			continue
		}

		if resp.StatusCode != http.StatusCreated {
			return tx, errorx.InternalServerError()
		}

	}
	return tx, errorx.Message{}
}

func addTags(event *event) error {
	tags := make(map[string]string)
	if len(event.Tags.RawMessage) > 0 && !reflect.DeepEqual(event.Tags, test.NilJsonb()) {
		err := json.Unmarshal(event.Tags.RawMessage, &tags)
		if err != nil {
			return err
		}
	}

	tags["app"] = "dega"

	bytesArr, err := json.Marshal(tags)
	if err != nil {
		return err
	}
	event.Tags.RawMessage = bytesArr
	return nil
}
